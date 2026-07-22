import { MotionManager } from './motionManager';
import type { NarrativeLine } from '../narrative/narrativeTypes';

export class BackgroundManager {
  private memoryExitTimer: number | undefined;
  private shuttleRumbleTimer: number | undefined;
  private fightVisualTimer: number | undefined;
  private memoryCueTimer: number | undefined;
  private readonly archiveVideo: HTMLVideoElement | null;
  private readonly archiveNeonVideo: HTMLVideoElement | null;
  private readonly fightVideo: HTMLVideoElement | null;
  private neonStarted = false;

  public constructor(
    private readonly root: HTMLElement,
    private readonly motion: MotionManager,
  ) {
    this.archiveVideo = this.root.querySelector<HTMLVideoElement>('.archive-video');
    this.archiveNeonVideo = this.root.querySelector<HTMLVideoElement>('.archive-neon-video');
    this.fightVideo = this.root.querySelector<HTMLVideoElement>('.chapter-fight-background__video');
  }

  public start(): void {
    if (this.motion.isReduced()) {
      this.root.dataset.reducedMotion = 'true';
      return;
    }

    window.addEventListener('pointermove', this.onPointerMove);
  }

  public stop(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
  }

  public setBackground(name: string): void {
    this.root.dataset.background = name;
  }

  public setMemoryErosion(level: 'none' | 'low' | 'mid' | 'critical'): void {
    if (level === 'none') {
      delete this.root.dataset.memoryErosion;
      return;
    }
    this.root.dataset.memoryErosion = level;
  }

  public setEffect(effect: string): void {
    if (effect === 'memory-drift') {
      window.clearTimeout(this.memoryExitTimer);
      const alreadyActive = this.root.classList.contains('fx-memory-drift');
      this.root.classList.remove('fx-memory-drift-exit');
      this.root.classList.add('fx-memory-drift');
      this.root.classList.remove('fx-memory-lock');
      delete this.root.dataset.memoryPhase;

      // Author tags can repeat across nearby knots. Keep the active archive
      // layer continuous instead of restarting the transition each time.
      if (alreadyActive) {
        return;
      }

      this.neonStarted = false;
      if (this.archiveNeonVideo) {
        this.archiveNeonVideo.pause();
        this.archiveNeonVideo.currentTime = 0;
      }

      if (this.archiveVideo) {
        this.archiveVideo.currentTime = 0;
        if (this.motion.isReduced()) {
          this.archiveVideo.pause();
        } else {
          void this.archiveVideo.play().catch(() => undefined);
        }
      }
      return;
    }

    if (effect === 'memory-drift-end') {
      this.root.classList.remove('fx-memory-drift');
      this.root.classList.add('fx-memory-drift-exit');
      this.memoryExitTimer = window.setTimeout(() => {
        this.root.classList.remove('fx-memory-drift-exit');
        this.archiveVideo?.pause();
        this.archiveNeonVideo?.pause();
        delete this.root.dataset.memoryPhase;
        delete this.root.dataset.textDrift;
        delete this.root.dataset.activeLayer;
      }, 2400);
      return;
    }

    if (effect === 'memory-lock') {
      this.root.classList.add('fx-memory-lock');
      return;
    }

    if (effect === 'probability-pull') {
      this.root.classList.add('fx-probability-pull');
    }
  }

  public setLineContext(line: NarrativeLine): void {
    this.root.dataset.activeLayer = line.layer;

    if (line.lineId === 'bar_shuttle_01' || line.lineId === 'bar_city_35') {
      this.startShuttleRumble();
    }

    if (setMemoryBreakPhase(this.root, line.lineId)) {
      return;
    }

    if (!this.root.classList.contains('fx-memory-drift')) {
      return;
    }

    const lineId = line.lineId;
    const lineNumber = getCityLineNumber(lineId);
    this.root.dataset.textDrift = getCityTextDrift(lineId, lineNumber);
    if (lineId === 'bar_city_02') {
      this.playNeonOverlay();
    } else if (!this.neonStarted && isEstablishedCityLine(lineId, lineNumber)) {
      this.showNeonAfterglow();
    }
    if (lineId === 'bar_city_transition_01') {
      this.root.dataset.memoryPhase = 'arrival-1';
    } else if (lineId === 'bar_city_transition_02') {
      this.root.dataset.memoryPhase = 'arrival-2';
    } else if (lineId === 'bar_city_transition_02b') {
      this.root.dataset.memoryPhase = 'arrival-3';
    } else if (lineId === 'bar_city_01') {
      this.root.dataset.memoryPhase = 'arrival-4';
    } else if (lineId === 'bar_city_02' || lineId === 'bar_city_03') {
      this.root.dataset.memoryPhase = 'ignite';
    } else if (lineNumber !== null && lineNumber >= 39 && lineNumber <= 43) {
      this.root.dataset.memoryPhase = 'fracture';
    } else if (lineNumber === 44) {
      this.root.dataset.memoryPhase = 'time';
    } else if (isCityReturnPhase(lineId, lineNumber)) {
      this.root.dataset.memoryPhase = 'return';
    } else {
      this.root.dataset.memoryPhase = 'city';
    }
  }

  public setVisualEffect(effect: string): void {
    if (effect === 'memory_return_flash') {
      this.root.classList.remove('fx-probability-pull');
    }

    window.clearTimeout(this.fightVisualTimer);
    delete this.root.dataset.visualEffect;
    void this.root.offsetWidth;
    this.root.dataset.visualEffect = effect;

    if (effect === 'unnatural_stillness' || effect === 'bluespace_correction') {
      this.fightVideo?.pause();
      return;
    }

    if (this.fightVideo?.paused && !this.motion.isReduced()) {
      void this.fightVideo.play().catch(() => undefined);
    }

    const duration = effect === 'impact_blackout'
      ? 1750
      : effect === 'fight_aftermath_flash' || effect === 'memory_return_flash'
      ? 1650
      : effect === 'all_versions' || effect === 'hard_double_exposure'
      ? 1900
      : effect === 'causal_gap' || effect === 'bluespace_correction'
      ? 1750
      : effect === 'temple_pain_flash'
        ? 1350
      : effect === 'clock_focus'
        ? 1700
      : 1150;
    this.fightVisualTimer = window.setTimeout(() => {
      if (this.root.dataset.visualEffect === effect) {
        delete this.root.dataset.visualEffect;
      }
    }, duration);
  }

  public setMemoryCue(cue: string): void {
    window.clearTimeout(this.memoryCueTimer);
    delete this.root.dataset.memoryCue;
    void this.root.offsetWidth;
    this.root.dataset.memoryCue = cue;

    const duration = cue === 'contradiction' || cue === 'spatial_contradiction' ? 1650 : 1150;
    this.memoryCueTimer = window.setTimeout(() => {
      if (this.root.dataset.memoryCue === cue) {
        delete this.root.dataset.memoryCue;
      }
    }, duration);
  }

  public reset(): void {
    window.clearTimeout(this.memoryExitTimer);
    window.clearTimeout(this.shuttleRumbleTimer);
    window.clearTimeout(this.fightVisualTimer);
    window.clearTimeout(this.memoryCueTimer);
    this.archiveVideo?.pause();
    this.archiveNeonVideo?.pause();
    this.neonStarted = false;
    this.root.dataset.background = 'bar-soft';
    this.root.classList.remove(
      'fx-memory-drift',
      'fx-memory-drift-exit',
      'fx-memory-lock',
      'fx-probability-pull',
      'fx-shuttle-rumble',
    );
    delete this.root.dataset.memoryPhase;
    delete this.root.dataset.textDrift;
    delete this.root.dataset.activeLayer;
    delete this.root.dataset.visualEffect;
    delete this.root.dataset.memoryCue;
    delete this.root.dataset.memoryErosion;
  }

  public suspend(): void {
    this.archiveVideo?.pause();
    this.archiveNeonVideo?.pause();
  }

  public resume(): void {
    if (this.motion.isReduced() || !this.root.classList.contains('fx-memory-drift')) return;
    void this.archiveVideo?.play().catch(() => undefined);
    if (
      this.archiveNeonVideo &&
      this.neonStarted &&
      !this.archiveNeonVideo.ended &&
      this.archiveNeonVideo.currentTime < this.archiveNeonVideo.duration
    ) {
      void this.archiveNeonVideo.play().catch(() => undefined);
    }
  }

  private startShuttleRumble(): void {
    if (this.motion.isReduced()) {
      return;
    }

    window.clearTimeout(this.shuttleRumbleTimer);
    this.root.classList.remove('fx-shuttle-rumble');
    // Restart the animation even when two shuttle cues are reached quickly.
    void this.root.offsetWidth;
    this.root.classList.add('fx-shuttle-rumble');
    this.shuttleRumbleTimer = window.setTimeout(() => {
      this.root.classList.remove('fx-shuttle-rumble');
    }, 2400);
  }

  private playNeonOverlay(): void {
    if (!this.archiveNeonVideo || this.motion.isReduced()) return;
    this.neonStarted = true;
    this.archiveNeonVideo.currentTime = 0;
    void this.archiveNeonVideo.play().catch(() => undefined);
  }

  private showNeonAfterglow(): void {
    if (!this.archiveNeonVideo || this.motion.isReduced()) return;
    this.neonStarted = true;

    const seekToEnd = (): void => {
      const duration = this.archiveNeonVideo?.duration;
      if (duration !== undefined && Number.isFinite(duration)) {
        this.archiveNeonVideo!.currentTime = Math.max(0, duration - 0.08);
      }
    };

    if (this.archiveNeonVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seekToEnd();
    } else {
      this.archiveNeonVideo.addEventListener('loadedmetadata', seekToEnd, { once: true });
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    this.root.style.setProperty('--pointer-x', x.toFixed(3));
    this.root.style.setProperty('--pointer-y', y.toFixed(3));
  };
}

function getCityLineNumber(lineId: string | undefined): number | null {
  const match = lineId?.match(/^bar_city_(\d+)$/);
  return match ? Number(match[1]) : null;
}

function getCityTextDrift(lineId: string | undefined, lineNumber: number | null): string {
  if (lineId === 'bar_city_transition_01') return 'enter-1';
  if (lineId === 'bar_city_transition_02') return 'enter-2';
  if (lineId === 'bar_city_transition_02b') return 'enter-3';
  if (lineId === 'bar_city_01') return 'enter-4';
  if (lineId === 'bar_city_02' || lineId === 'bar_city_03') return 'enter-4';
  if (lineNumber !== null && lineNumber >= 39 && lineNumber <= 44) return 'unstable';
  if (lineNumber !== null && lineNumber >= 45 && lineNumber <= 49) return 'settle-1';
  if (lineId === 'bar_city_archive_04' || lineNumber === 50 || lineNumber === 51) {
    return 'settle-2';
  }
  if (lineId?.match(/^bar_city_(?:home|hole|escape)_/)) return 'settle-3';
  return 'full';
}

function isEstablishedCityLine(lineId: string | undefined, lineNumber: number | null): boolean {
  return Boolean(
    (lineNumber !== null && lineNumber >= 3) ||
      lineId?.startsWith('bar_city_archive_') ||
      lineId?.match(/^bar_city_(?:voice|home|hole|escape)_/),
  );
}

function isCityReturnPhase(lineId: string | undefined, lineNumber: number | null): boolean {
  return Boolean(
    (lineNumber !== null && lineNumber >= 45 && lineNumber <= 51) ||
      lineId === 'bar_city_archive_04' ||
      lineId?.match(/^bar_city_(?:home|hole|escape)_/),
  );
}

function setMemoryBreakPhase(root: HTMLElement, lineId: string | undefined): boolean {
  if (lineId === 'bar_unknown_01') {
    root.dataset.memoryPhase = 'memory-fixed';
    return true;
  }

  const match = lineId?.match(/^bar_memory_break_(\d+)$/);
  if (!match) {
    return false;
  }

  const lineNumber = Number(match[1]);
  if (lineNumber <= 4) {
    root.dataset.memoryPhase = 'memory-calm';
  } else if (lineNumber <= 16) {
    root.dataset.memoryPhase = 'memory-unravel';
  } else if (lineNumber === 17 || lineNumber === 23 || lineNumber === 24) {
    root.dataset.memoryPhase = 'memory-void';
  } else if (lineNumber === 18) {
    root.dataset.memoryPhase = 'memory-clock';
  } else if (lineNumber <= 20) {
    root.dataset.memoryPhase = 'memory-time';
  } else if (lineNumber <= 22) {
    root.dataset.memoryPhase = 'memory-voice-far';
  } else if (lineNumber === 25) {
    root.dataset.memoryPhase = 'memory-voice-near';
  } else if (lineNumber <= 27) {
    root.dataset.memoryPhase = 'memory-returning';
  } else if (lineNumber === 28) {
    root.dataset.memoryPhase = 'memory-return';
  } else {
    root.dataset.memoryPhase = 'memory-wrong';
  }

  return true;
}
