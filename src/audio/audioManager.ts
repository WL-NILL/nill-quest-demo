import { Howl, Howler } from 'howler';
import type { AUDIO_CONFIG } from '../config/audioConfig';

type AudioConfig = typeof AUDIO_CONFIG;
type SampledEffect = {
  howl: Howl | null;
  volume: number;
  unavailable: boolean;
};

export class AudioManager {
  private howl: Howl | null = null;
  private advanceClick: Howl | null = null;
  private choiceClick: Howl | null = null;
  private smokeInhale: Howl | null = null;
  private smokeExhale: Howl | null = null;
  private door: Howl | null = null;
  private shuttle: Howl | null = null;
  private fightEndFlash: Howl | null = null;
  private aftermathDrop: Howl | null = null;
  private memoryRealign: Howl | null = null;
  private readonly sampledStoryEffects = new Map<string, SampledEffect>();
  private unavailable = false;
  private advanceClickUnavailable = false;
  private choiceClickUnavailable = false;
  private smokeInhaleUnavailable = false;
  private smokeExhaleUnavailable = false;
  private doorUnavailable = false;
  private shuttleUnavailable = false;
  private fightEndFlashUnavailable = false;
  private aftermathDropUnavailable = false;
  private memoryRealignUnavailable = false;
  private userInteracted = false;
  private requested = false;
  private sceneMusicSuspended = false;
  private starting = false;
  private started = false;
  private muted = false;
  private pauseTimer: number | undefined;
  private pendingFadeInMs: number;
  private storyEffectGain = 1;

  public constructor(private readonly config: AudioConfig) {
    this.pendingFadeInMs = config.fadeInMs;

    this.howl = new Howl({
      src: [config.musicSrc],
      loop: config.loop,
      volume: 0,
      preload: true,
      onloaderror: () => {
        this.unavailable = true;
        this.starting = false;
      },
      onplayerror: () => {
        this.starting = false;
        this.started = false;
        this.howl?.once('unlock', () => this.tryStart());
      },
      onplay: (id) => {
        this.starting = false;
        if (this.sceneMusicSuspended) {
          this.howl?.pause(id);
          this.started = false;
          return;
        }
        this.started = true;
        this.howl?.volume(0, id);
        this.howl?.fade(0, this.config.musicVolume, this.pendingFadeInMs, id);
        this.pendingFadeInMs = this.config.fadeInMs;
      },
    });

    this.advanceClick = new Howl({
      src: [config.advanceClickSrc],
      volume: config.advanceClickVolume,
      preload: true,
      onloaderror: () => {
        this.advanceClickUnavailable = true;
      },
    });

    this.choiceClick = new Howl({
      src: [config.choiceClickSrc],
      volume: config.choiceClickVolume,
      preload: true,
      onloaderror: () => {
        this.choiceClickUnavailable = true;
      },
    });

    this.smokeInhale = new Howl({
      src: [config.smokeInhaleSrc],
      volume: config.smokeInhaleVolume,
      preload: true,
      onloaderror: () => {
        this.smokeInhaleUnavailable = true;
      },
    });

    this.smokeExhale = new Howl({
      src: [config.smokeExhaleSrc],
      volume: config.smokeExhaleVolume,
      preload: true,
      onloaderror: () => {
        this.smokeExhaleUnavailable = true;
      },
    });

    this.door = new Howl({
      src: [config.doorSrc],
      volume: config.doorVolume,
      preload: true,
      onloaderror: () => {
        this.doorUnavailable = true;
      },
    });

    this.shuttle = new Howl({
      src: [config.shuttleSrc],
      volume: config.shuttleVolume,
      preload: true,
      onloaderror: () => {
        this.shuttleUnavailable = true;
      },
    });

    this.fightEndFlash = new Howl({
      src: [config.fightEndFlashSrc],
      volume: config.fightEndFlashVolume,
      preload: true,
      onloaderror: () => {
        this.fightEndFlashUnavailable = true;
      },
    });

    this.aftermathDrop = new Howl({
      src: [config.aftermathDropSrc],
      volume: config.aftermathDropVolume,
      preload: true,
      onloaderror: () => {
        this.aftermathDropUnavailable = true;
      },
    });

    this.memoryRealign = new Howl({
      src: [config.memoryRealignSrc],
      volume: config.memoryRealignVolume,
      preload: true,
      onloaderror: () => {
        this.memoryRealignUnavailable = true;
      },
    });

    for (const [effectId, definition] of Object.entries(config.sampledStoryEffects)) {
      const sampled: SampledEffect = {
        howl: null,
        volume: definition.volume,
        unavailable: false,
      };
      sampled.howl = new Howl({
        src: [definition.src],
        volume: definition.volume,
        preload: true,
        onloaderror: () => {
          sampled.unavailable = true;
        },
      });
      this.sampledStoryEffects.set(effectId, sampled);
    }
  }

  public requestStart(): void {
    this.requested = true;
    this.sceneMusicSuspended = false;
    this.tryStart();
  }

  /**
   * Warm the audio buffers before a chapter becomes interactive. A broken or
   * slow asset must never trap the reader on a loading screen, hence the
   * bounded wait and load-error fallback.
   */
  public async preloadChapter(chapter: 1 | 2, timeoutMs = 8_000): Promise<void> {
    const shared = [this.advanceClick, this.choiceClick];
    const chapterAudio = chapter === 1
      ? [this.howl, this.smokeInhale, this.smokeExhale, this.door, this.shuttle]
      : [
          this.fightEndFlash,
          this.aftermathDrop,
          this.memoryRealign,
          ...[...this.sampledStoryEffects.values()].map((effect) => effect.howl),
        ];

    await this.waitForHowls([...shared, ...chapterAudio], timeoutMs);
  }

  public onUserInteraction(): void {
    this.userInteracted = true;
    if (Howler.usingWebAudio && Howler.ctx.state !== 'running') {
      void Howler.ctx
        .resume()
        .then(() => this.tryStart())
        .catch(() => undefined);
      return;
    }
    this.tryStart();
  }

  public setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;
    this.howl?.mute(nextMuted);
    this.advanceClick?.mute(nextMuted);
    this.choiceClick?.mute(nextMuted);
    this.smokeInhale?.mute(nextMuted);
    this.smokeExhale?.mute(nextMuted);
    this.door?.mute(nextMuted);
    this.shuttle?.mute(nextMuted);
    this.fightEndFlash?.mute(nextMuted);
    this.aftermathDrop?.mute(nextMuted);
    this.memoryRealign?.mute(nextMuted);
    for (const sampled of this.sampledStoryEffects.values()) {
      sampled.howl?.mute(nextMuted);
    }
  }

  public playAdvanceSound(): void {
    this.playEffect(this.advanceClick, this.advanceClickUnavailable, this.config.advanceClickVolume);
  }

  public playChoiceSound(): void {
    this.playEffect(this.choiceClick, this.choiceClickUnavailable, this.config.choiceClickVolume);
  }

  public playStoryEffect(effect: string): void {
    if (effect === 'hollow') {
      const variants = ['hollow-01', 'hollow-02', 'hollow-03'] as const;
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const sampledVariant = this.sampledStoryEffects.get(variant);
      if (sampledVariant) {
        this.playEffect(
          sampledVariant.howl,
          sampledVariant.unavailable,
          this.scaleStoryEffectVolume(sampledVariant.volume),
        );
      }
      return;
    }

    if (effect === 'glass-knee-fall') {
      const glass = this.sampledStoryEffects.get('glass_fall');
      if (glass) {
        this.playEffect(glass.howl, glass.unavailable, this.scaleStoryEffectVolume(glass.volume));
      }
      const fall = this.sampledStoryEffects.get('knee-fall');
      if (fall) {
        window.setTimeout(
          () => this.playEffect(fall.howl, fall.unavailable, this.scaleStoryEffectVolume(fall.volume)),
          90,
        );
      }
      return;
    }

    const sampled = this.sampledStoryEffects.get(effect);
    if (sampled) {
      this.playEffect(sampled.howl, sampled.unavailable, this.scaleStoryEffectVolume(sampled.volume));
    } else if (effect === 'smoke-inhale') {
      this.playEffect(
        this.smokeInhale,
        this.smokeInhaleUnavailable,
        this.scaleStoryEffectVolume(this.config.smokeInhaleVolume),
      );
    } else if (effect === 'smoke-exhale') {
      this.playEffect(
        this.smokeExhale,
        this.smokeExhaleUnavailable,
        this.scaleStoryEffectVolume(this.config.smokeExhaleVolume),
      );
    } else if (effect === 'door') {
      this.playEffect(
        this.door,
        this.doorUnavailable,
        this.scaleStoryEffectVolume(this.config.doorVolume),
      );
    } else if (effect === 'shuttle') {
      this.playEffect(
        this.shuttle,
        this.shuttleUnavailable,
        this.scaleStoryEffectVolume(this.config.shuttleVolume),
      );
    } else if (effect === 'fight-end-flash') {
      this.playEffect(
        this.fightEndFlash,
        this.fightEndFlashUnavailable,
        this.scaleStoryEffectVolume(this.config.fightEndFlashVolume),
      );
    } else if (effect === 'aftermath-drop') {
      this.playEffect(
        this.aftermathDrop,
        this.aftermathDropUnavailable,
        this.scaleStoryEffectVolume(this.config.aftermathDropVolume),
      );
    } else if (effect === 'memory-realign') {
      this.playEffect(
        this.memoryRealign,
        this.memoryRealignUnavailable,
        this.scaleStoryEffectVolume(this.config.memoryRealignVolume),
      );
    }
  }

  public setStoryEffectGain(gain: number): void {
    this.storyEffectGain = Math.min(2, Math.max(0, gain));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isStarted(): boolean {
    return this.started;
  }

  public fadeOutAndStop(durationMs: number = this.config.fadeOutMs): void {
    window.clearTimeout(this.pauseTimer);
    if (!this.howl || !this.started) {
      return;
    }

    const currentVolume = this.howl.volume();
    this.howl.fade(currentVolume, 0, durationMs);
    window.setTimeout(() => {
      this.howl?.stop();
      this.started = false;
    }, durationMs + 20);
  }

  public fadeOutAndPause(durationMs: number = this.config.fadeOutMs): void {
    // Scene-owned scores (chapter II) suppress the chapter I bar loop. Keep
    // this latch set across subsequent clicks, otherwise onUserInteraction()
    // would silently wake the bar music underneath the fight score.
    this.sceneMusicSuspended = true;
    if (!this.howl || !this.started) return;
    window.clearTimeout(this.pauseTimer);
    const currentVolume = this.howl.volume();
    this.howl.fade(currentVolume, 0, durationMs);
    this.pauseTimer = window.setTimeout(() => {
      this.howl?.pause();
      this.started = false;
    }, durationMs + 20);
  }

  public resumeRequestedMusic(fadeInMs = this.config.fadeInMs): void {
    this.requested = true;
    this.sceneMusicSuspended = false;
    window.clearTimeout(this.pauseTimer);
    if (this.howl && this.started) {
      this.howl.fade(this.howl.volume(), this.config.musicVolume, fadeInMs);
      return;
    }
    this.tryStart(fadeInMs);
  }

  private scaleStoryEffectVolume(volume: number): number {
    return Math.min(1, volume * this.storyEffectGain);
  }

  private tryStart(fadeInMs = this.config.fadeInMs): void {
    if (
      !this.howl ||
      this.unavailable ||
      this.starting ||
      this.started ||
      !this.userInteracted ||
      !this.requested ||
      this.sceneMusicSuspended ||
      (Howler.usingWebAudio && Howler.ctx.state !== 'running')
    ) {
      return;
    }

    this.pendingFadeInMs = Math.max(0, fadeInMs);
    this.howl.mute(this.muted);
    this.starting = true;
    this.howl.play();
  }

  private playEffect(effect: Howl | null, unavailable: boolean, volume: number): void {
    if (!effect || unavailable || this.muted || !this.userInteracted) {
      return;
    }

    if (Howler.usingWebAudio && Howler.ctx.state !== 'running') {
      void Howler.ctx
        .resume()
        .then(() => this.playEffect(effect, unavailable, volume))
        .catch(() => undefined);
      return;
    }

    effect.stop();
    effect.volume(volume);
    effect.play();
  }

  private async waitForHowls(howls: Array<Howl | null>, timeoutMs: number): Promise<void> {
    const uniqueHowls = [...new Set(howls.filter((howl): howl is Howl => howl !== null))];
    await Promise.all(uniqueHowls.map((howl) => new Promise<void>((resolve) => {
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
    })));
  }
}
