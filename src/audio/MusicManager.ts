import { Howl, Howler } from 'howler';
import { MUSIC_REGISTRY } from './musicRegistry';
import type { MusicDebugState, MusicState, MusicTrackId } from './types';

const DEFAULT_FADE_MS = 1800;
const SYNC_POINTS = [0, 16, 32, 48, 64, 80, 96];
const MUSIC_OUTPUT_GAIN = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createInitialMusicState(): MusicState {
  return {
    enabled: true,
    masterVolume: 1,
    currentTrack: null,
    currentSeek: 0,
    targetVolume: MUSIC_REGISTRY.fight_memory.defaultVolume,
    isPlaying: false,
    isDucked: false,
    fractureOffsetMs: 0,
  };
}

export class MusicManager {
  private state: MusicState = createInitialMusicState();
  private howl: Howl | null = null;
  private readonly trackHowls = new Map<MusicTrackId, Howl>();
  private primaryId: number | null = null;
  private secondaryId: number | null = null;
  private unlocked = false;
  private desiredPlaying = false;
  private pendingCommand: string | null = null;
  private pendingFadeMs = DEFAULT_FADE_MS;
  private restoreVolume = MUSIC_REGISTRY.fight_memory.defaultVolume;
  private filter: string | null = null;
  private globallyMuted = false;
  private stopTimer: number | undefined;
  private commandLog: string[] = [];
  private listeners = new Set<() => void>();

  public restoreState(snapshot?: MusicState): void {
    if (!snapshot) return;
    this.stopAll(false);
    const restoredTrack =
      snapshot.currentTrack && snapshot.currentTrack in MUSIC_REGISTRY
        ? snapshot.currentTrack as MusicTrackId
        : null;
    const restoredDefaultVolume = restoredTrack
      ? MUSIC_REGISTRY[restoredTrack].defaultVolume
      : MUSIC_REGISTRY.fight_memory.defaultVolume;
    this.state = {
      enabled: snapshot.enabled !== false,
      masterVolume: clamp(Number(snapshot.masterVolume) || 1, 0, 1),
      currentTrack: restoredTrack,
      currentSeek: Math.max(0, Number(snapshot.currentSeek) || 0),
      targetVolume: clamp(Number(snapshot.targetVolume) || restoredDefaultVolume, 0, 1),
      isPlaying: false,
      isDucked: snapshot.isDucked === true,
      fractureOffsetMs: clamp(Number(snapshot.fractureOffsetMs) || 0, 0, 420),
    };
    this.howl = restoredTrack ? this.getOrCreateHowl(restoredTrack) : null;
    this.desiredPlaying = snapshot.isPlaying === true;
    this.pendingCommand = this.desiredPlaying ? 'resume restored state' : null;
    this.emit();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public unlock(): void {
    this.unlocked = true;
    if (Howler.usingWebAudio && Howler.ctx.state !== 'running') {
      void Howler.ctx.resume().then(() => this.tryStart()).catch(() => undefined);
    } else {
      this.tryStart();
    }
    this.emit();
  }

  public async preloadTracks(
    tracks: readonly MusicTrackId[] = Object.keys(MUSIC_REGISTRY) as MusicTrackId[],
    timeoutMs = 10_000,
  ): Promise<void> {
    await Promise.all(tracks.map((track) => {
      const howl = this.getOrCreateHowl(track);
      return new Promise<void>((resolve) => {
        if (howl.state() === 'loaded') {
          resolve();
          return;
        }

        let settled = false;
        const finish = (): void => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          howl.off('load', finish);
          howl.off('loaderror', finish);
          resolve();
        };
        const timer = window.setTimeout(finish, timeoutMs);
        howl.once('load', finish);
        howl.once('loaderror', finish);
        if (howl.state() === 'unloaded') howl.load();
      });
    }));
  }

  public handleCommands(commands: readonly string[]): void {
    if (commands.length === 0) return;
    const startsTrack = commands.some((command) => command.trim().startsWith('start '));
    const hasExplicitFade = commands.some(
      (command) => this.splitCommand(command)[0] === 'fade',
    );
    const requestedVolumeCommand = [...commands]
      .reverse()
      .find((command) => this.splitCommand(command)[0] === 'volume');
    const requestedVolume = requestedVolumeCommand
      ? Number(this.splitCommand(requestedVolumeCommand)[1])
      : undefined;

    // Fade and volume describe the action in the same Ink line, even when
    // authors place them after music:start.
    for (const command of commands) {
      const [action, value] = this.splitCommand(command);
      if (action === 'fade') this.pendingFadeMs = clamp(Number(value) || DEFAULT_FADE_MS, 0, 30_000);
    }

    for (const command of commands) {
      const [action, value] = this.splitCommand(command);
      this.log(command);
      if (action === 'fade' || action === 'volume') continue;
      if (action === 'start') this.start(value, requestedVolume);
      else if (action === 'stop') this.stop(false);
      else if (action === 'pause') this.pause();
      else if (action === 'resume') this.resume();
      else if (action === 'duck') this.duck(Number(value), hasExplicitFade ? this.pendingFadeMs : 220);
      else if (action === 'restore') this.restore();
      else if (action === 'restart') this.restart();
      else if (action === 'seek') this.seek(Number(value));
      else if (action === 'desync') this.desync();
      else if (action === 'resync') this.resync();
      else if (action === 'cut') this.cut();
      else if (action === 'filter') this.filter = value || null;
    }
    if (!startsTrack && requestedVolume !== undefined) {
      this.setTargetVolume(requestedVolume);
    }
    this.pendingFadeMs = DEFAULT_FADE_MS;
    this.emit();
  }

  public setEnabled(enabled: boolean): void {
    if (this.state.enabled === enabled) return;
    this.state.enabled = enabled;
    if (!enabled) this.fadePause(500, true);
    else if (this.desiredPlaying) this.tryStart(900);
    this.emit();
  }

  public setMuted(muted: boolean): void {
    this.globallyMuted = muted;
    if (muted) this.fadeToEffective(250);
    else if (this.desiredPlaying) this.tryStart(350);
    this.emit();
  }

  public setMasterVolume(volume: number): void {
    this.state.masterVolume = clamp(volume, 0, 1);
    this.fadeToEffective(350);
    this.emit();
  }

  public snapshot(): MusicState {
    this.captureSeek();
    return { ...this.state, isPlaying: this.desiredPlaying };
  }

  public checkpoint(): MusicState {
    return this.snapshot();
  }

  public restoreCheckpoint(snapshot?: MusicState, dislocate = false): void {
    if (!snapshot) return;
    const restored = { ...snapshot };
    if (dislocate && restored.currentTrack) {
      const track = this.getOrCreateHowl(restored.currentTrack);
      const duration = Number(track.duration()) || 0;
      if (duration > 8) {
        const lower = Math.min(6, duration * 0.1);
        const upper = Math.max(lower, duration * 0.88);
        restored.currentSeek = lower + Math.random() * (upper - lower);
      } else {
        restored.currentSeek = Math.max(0, restored.currentSeek + 7 + Math.random() * 11);
      }
      restored.fractureOffsetMs = Math.max(restored.fractureOffsetMs, 180);
    }
    this.restoreState(restored);
    if (snapshot.isPlaying) this.tryStart(900);
  }

  public pauseForMenu(): void {
    this.captureSeek();
    this.stopSecondary();
    this.fadePause(650, false);
  }

  public resumeFromMenu(): void {
    if (this.desiredPlaying) this.tryStart(1000);
  }

  public reset(): void {
    this.stopAll(true);
    this.state = createInitialMusicState();
    this.desiredPlaying = false;
    this.pendingCommand = null;
    this.filter = null;
    this.emit();
  }

  public getDebugState(): MusicDebugState {
    this.captureSeek();
    return {
      ...this.state,
      isPlaying: this.primaryId !== null && Boolean(this.howl?.playing(this.primaryId)),
      effectiveVolume: this.effectiveVolume(),
      primaryHowlId: this.primaryId,
      secondaryHowlId: this.secondaryId,
      autoplayUnlocked: this.unlocked,
      pendingMusicCommand: this.pendingCommand,
      filter: this.filter,
      recentCommands: [...this.commandLog],
    };
  }

  private start(trackName: string, volumeOverride?: number): void {
    if (!(trackName in MUSIC_REGISTRY)) return;
    const track = trackName as MusicTrackId;
    if (this.state.currentTrack !== track) {
      this.stopAll(false);
      this.state.currentTrack = track;
      this.state.currentSeek = 0;
      this.howl = this.getOrCreateHowl(track);
    }
    const requestedVolume = Number.isFinite(volumeOverride)
      ? clamp(volumeOverride as number, 0, 1)
      : MUSIC_REGISTRY[track].defaultVolume;
    this.state.targetVolume = requestedVolume;
    this.restoreVolume = requestedVolume;
    this.state.isDucked = false;
    this.desiredPlaying = true;
    this.pendingCommand = `start ${track}`;
    this.tryStart(this.pendingFadeMs);
  }

  private createHowl(track: MusicTrackId): Howl {
    const definition = MUSIC_REGISTRY[track];
    return new Howl({
      src: definition.src,
      loop: definition.loop,
      volume: 0,
      preload: true,
      html5: false,
      onplayerror: () => {
        this.pendingCommand = `start ${track}`;
        this.primaryId = null;
        this.emit();
      },
      onloaderror: (_id, error) => {
        console.warn(`Unable to load music track ${track}`, error);
      },
    });
  }

  private getOrCreateHowl(track: MusicTrackId): Howl {
    const cached = this.trackHowls.get(track);
    if (cached) return cached;
    const howl = this.createHowl(track);
    this.trackHowls.set(track, howl);
    return howl;
  }

  private tryStart(fadeMs = DEFAULT_FADE_MS): void {
    if (!this.desiredPlaying || !this.state.enabled || !this.unlocked || !this.state.currentTrack) return;
    if (Howler.usingWebAudio && Howler.ctx.state !== 'running') return;
    if (!this.howl) this.howl = this.getOrCreateHowl(this.state.currentTrack);
    // A menu may be closed before its fade-pause timer has fired. Cancelling
    // it here prevents that stale timer from pausing a track after resume.
    window.clearTimeout(this.stopTimer);
    if (this.primaryId !== null && this.howl.playing(this.primaryId)) {
      this.fadeToEffective(fadeMs);
      this.pendingCommand = null;
      return;
    }
    // If Howler still owns an untracked instance (for example after an
    // interrupted menu transition), remove it before creating the canonical
    // primary voice. A track may have one primary plus the deliberate
    // fracture layer, never two accidental primaries.
    if (this.primaryId === null && this.howl.playing()) this.howl.stop();
    const id = this.howl.play();
    this.primaryId = id;
    this.howl.seek(this.state.currentSeek, id);
    this.howl.volume(0, id);
    this.howl.fade(0, this.effectiveVolume(), fadeMs, id);
    this.state.isPlaying = true;
    this.pendingCommand = null;
    if (this.state.fractureOffsetMs > 0) this.startSecondary();
    this.emit();
  }

  private stop(resetSeek: boolean): void {
    this.captureSeek();
    this.desiredPlaying = false;
    this.stopSecondary();
    if (!this.howl || this.primaryId === null) return;
    const id = this.primaryId;
    const from = Number(this.howl.volume(id)) || 0;
    this.howl.fade(from, 0, this.pendingFadeMs, id);
    window.clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => {
      this.howl?.stop(id);
      if (this.primaryId === id) this.primaryId = null;
      this.state.isPlaying = false;
      if (resetSeek) this.state.currentSeek = 0;
      this.emit();
    }, this.pendingFadeMs + 20);
  }

  private pause(): void {
    this.desiredPlaying = false;
    this.captureSeek();
    this.stopSecondary();
    if (this.howl && this.primaryId !== null) this.howl.pause(this.primaryId);
    this.primaryId = null;
    this.state.isPlaying = false;
  }

  private resume(): void {
    this.desiredPlaying = true;
    this.pendingCommand = 'resume';
    this.tryStart(this.pendingFadeMs);
  }

  private restart(): void {
    this.state.currentSeek = 0;
    if (this.howl && this.primaryId !== null) this.howl.seek(0, this.primaryId);
    else this.resume();
  }

  private seek(seconds: number): void {
    if (!Number.isFinite(seconds)) return;
    this.state.currentSeek = Math.max(0, seconds);
    if (this.howl && this.primaryId !== null) this.howl.seek(this.state.currentSeek, this.primaryId);
    if (this.secondaryId !== null) this.startSecondary();
  }

  private duck(volume: number, duration = 220): void {
    if (!this.state.isDucked) this.restoreVolume = this.state.targetVolume;
    this.state.isDucked = true;
    this.state.targetVolume = clamp(Number.isFinite(volume) ? volume : 0.16, 0, 1);
    this.fadeToEffective(duration);
  }

  private restore(): void {
    this.state.isDucked = false;
    this.state.targetVolume = this.restoreVolume;
    this.filter = null;
    this.fadeToEffective(600);
  }

  private setTargetVolume(volume: number, fade = true): void {
    if (!Number.isFinite(volume)) return;
    this.state.targetVolume = clamp(volume, 0, 1);
    if (!this.state.isDucked) this.restoreVolume = this.state.targetVolume;
    if (fade) this.fadeToEffective(400);
  }

  private desync(): void {
    this.state.fractureOffsetMs = this.state.fractureOffsetMs < 180
      ? 180
      : this.state.fractureOffsetMs < 280
        ? 280
        : 420;
    this.startSecondary();
  }

  private startSecondary(): void {
    if (!this.howl || this.primaryId === null || !this.howl.playing(this.primaryId)) return;
    this.stopSecondary();
    const mainSeek = this.readSeek(this.primaryId);
    const id = this.howl.play();
    this.secondaryId = id;
    this.howl.seek(Math.max(0, mainSeek - this.state.fractureOffsetMs / 1000), id);
    const layerFactor = this.state.fractureOffsetMs >= 420 ? 0.22 : this.state.fractureOffsetMs >= 280 ? 0.19 : 0.15;
    this.howl.volume(this.effectiveVolume() * layerFactor, id);
  }

  private resync(): void {
    this.stopSecondary();
    this.state.fractureOffsetMs = 0;
    if (!this.howl || this.primaryId === null) return;
    const id = this.primaryId;
    const current = this.readSeek(id);
    const syncPoint = [...SYNC_POINTS].reverse().find((point) => point <= current) ?? 0;
    const from = Number(this.howl.volume(id)) || this.effectiveVolume();
    this.howl.fade(from, 0, 120, id);
    window.setTimeout(() => {
      if (!this.howl || this.primaryId !== id) return;
      this.howl.seek(syncPoint, id);
      this.state.currentSeek = syncPoint;
      this.howl.fade(0, this.effectiveVolume(), 180, id);
    }, 130);
  }

  private cut(): void {
    this.captureSeek();
    this.desiredPlaying = false;
    this.stopAll(false);
    this.state.isPlaying = false;
  }

  private fadePause(duration: number, retainDesired: boolean): void {
    this.captureSeek();
    this.stopSecondary();
    if (!retainDesired) this.desiredPlaying = true;
    if (!this.howl || this.primaryId === null) return;
    const id = this.primaryId;
    const from = Number(this.howl.volume(id)) || 0;
    this.howl.fade(from, 0, duration, id);
    window.clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => {
      this.howl?.pause(id);
      if (this.primaryId === id) this.primaryId = null;
      this.state.isPlaying = false;
      this.emit();
    }, duration + 20);
  }

  private stopAll(resetSeek: boolean): void {
    window.clearTimeout(this.stopTimer);
    this.howl?.stop();
    this.primaryId = null;
    this.secondaryId = null;
    this.state.isPlaying = false;
    if (resetSeek) this.state.currentSeek = 0;
  }

  private stopSecondary(): void {
    if (this.howl && this.secondaryId !== null) this.howl.stop(this.secondaryId);
    this.secondaryId = null;
  }

  private fadeToEffective(duration: number): void {
    if (!this.howl || this.primaryId === null || !this.howl.playing(this.primaryId)) return;
    const from = Number(this.howl.volume(this.primaryId)) || 0;
    this.howl.fade(from, this.effectiveVolume(), duration, this.primaryId);
    if (this.secondaryId !== null) {
      const secondaryFrom = Number(this.howl.volume(this.secondaryId)) || 0;
      this.howl.fade(secondaryFrom, this.effectiveVolume() * 0.18, duration, this.secondaryId);
    }
  }

  private effectiveVolume(): number {
    return this.state.enabled && !this.globallyMuted
      ? this.state.targetVolume * this.state.masterVolume * MUSIC_OUTPUT_GAIN
      : 0;
  }

  private captureSeek(): void {
    if (this.howl && this.primaryId !== null) this.state.currentSeek = this.readSeek(this.primaryId);
  }

  private readSeek(id: number): number {
    const value = this.howl?.seek(id);
    return typeof value === 'number' && Number.isFinite(value) ? value : this.state.currentSeek;
  }

  private splitCommand(command: string): [string, string] {
    const [action = '', ...rest] = command.trim().split(/\s+/);
    return [action.toLowerCase(), rest.join(' ')];
  }

  private log(command: string): void {
    this.commandLog = [...this.commandLog, command].slice(-10);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
