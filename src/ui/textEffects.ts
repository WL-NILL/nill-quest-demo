import { animate } from 'animejs/animation';
import { steps } from 'animejs/easings/steps';
import { createTimeline } from 'animejs/timeline';
import { stagger } from 'animejs/utils';
import { splitText } from 'animejs/text';
import type { Timer } from 'animejs/timer';

const runningEffects = new WeakMap<HTMLElement, Set<Timer>>();

export function playTextEffects(line: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    settleTextEffects(line);
    return;
  }

  for (const mark of line.querySelectorAll<HTMLElement>('.memory-mark--uncertain')) {
    playUncertainEffect(line, mark);
  }

  for (const mutation of line.querySelectorAll<HTMLElement>('.memory-mutation--rewrite')) {
    playRewriteEffect(line, mutation);
  }

  for (const mutation of line.querySelectorAll<HTMLElement>('.memory-mutation--alternate')) {
    playAlternateEffect(line, mutation);
  }

  playTaggedMemoryEffect(line);
}

export function finishTextEffects(line: HTMLElement): void {
  const effects = runningEffects.get(line);
  if (effects) {
    for (const effect of effects) effect.complete(true);
    effects.clear();
  }
  settleTextEffects(line);
}

export function settleTextEffects(line: HTMLElement): void {
  settleGeneratedMemoryEffect(line);

  for (const mutation of line.querySelectorAll<HTMLElement>('.memory-mutation')) {
    if (mutation.classList.contains('memory-mutation--split-word')) continue;

    const original = mutation.querySelector<HTMLElement>('.memory-mutation__original');
    const replacement = mutation.querySelector<HTMLElement>('.memory-mutation__replacement');
    if (!original || !replacement) continue;

    original.style.removeProperty('transform');
    original.style.removeProperty('filter');
    replacement.style.removeProperty('transform');
    replacement.style.removeProperty('filter');

    if (mutation.classList.contains('memory-mutation--rewrite')) {
      original.textContent = replacement.textContent;
      mutation.classList.add('is-rewritten');
    }

    original.style.opacity = '1';
    replacement.style.opacity = '0';
    mutation.classList.add('is-text-effect-settled');
  }
}

function playTaggedMemoryEffect(line: HTMLElement): void {
  const text = getTextTarget(line);
  if (!text) return;

  const visual = line.dataset.visualEffect;
  const cue = line.dataset.memoryCue;
  const decorated = Boolean(text.querySelector('.memory-mark, .memory-mutation'));

  // Decorated fragments already own their letter-level motion. They can still
  // receive whole-line echoes, but must never pass through splitText because
  // that would destroy the semantic mark/rewrite wrappers.
  if (decorated) {
    if (
      visual === 'motion_repeat' ||
      visual === 'double_position' ||
      visual === 'object_double' ||
      visual === 'edward_split'
    ) {
      playPersistentFracture(line, text, false);
    } else if (visual === 'hard_double_exposure' || visual === 'all_versions') {
      playPersistentFracture(line, text, true);
    } else if (cue === 'contradiction' || cue === 'spatial_contradiction') {
      playMemoryRejection(line, text, cue === 'spatial_contradiction');
    } else if (cue === 'force_anchor') {
      playDecoratedForcedAnchor(line, text);
    }
    return;
  }

  if (visual === 'bluespace_correction') {
    playBluespaceCorrection(line, text);
  } else if (visual === 'causal_gap') {
    playCausalGap(line, text);
  } else if (
    visual === 'motion_repeat' ||
    visual === 'double_position' ||
    visual === 'object_double' ||
    visual === 'edward_split'
  ) {
    playPersistentFracture(line, text, false);
  } else if (visual === 'hard_double_exposure' || visual === 'all_versions') {
    playPersistentFracture(line, text, true);
  } else if (visual === 'unnatural_stillness') {
    playPerfectLock(line, text, true);
  } else if (cue === 'match' || cue === 'anchor_created') {
    playMemoryAssembly(line, text);
  } else if (cue === 'contradiction' || cue === 'spatial_contradiction') {
    playMemoryRejection(line, text, cue === 'spatial_contradiction');
  } else if (cue === 'force_anchor') {
    playForcedAnchor(line, text);
  } else if (cue === 'flicker') {
    playMemoryFlicker(line, text);
  } else if (cue === 'perfect_sequence') {
    playPerfectLock(line, text, false);
  } else if (cue === 'partial_stability') {
    playPartialStability(line, text);
  }
}

function playUncertainEffect(line: HTMLElement, mark: HTMLElement): void {
  mark.classList.add('is-anime-controlled');
  const { chars } = splitText(mark, {
    chars: { class: 'memory-char' },
    accessible: false,
  });

  const effect = animate(chars, {
    opacity: [0.38, 1],
    y: () => `${randomBetween(-1.6, 1.6)}px`,
    rotate: () => `${randomBetween(-0.9, 0.9)}deg`,
    filter: ['blur(1.7px)', 'blur(0px)'],
    duration: 980,
    delay: stagger(34, { from: 'random' }),
    ease: 'out(3)',
  });

  trackEffect(line, effect);
}

function playRewriteEffect(line: HTMLElement, mutation: HTMLElement): void {
  const original = mutation.querySelector<HTMLElement>('.memory-mutation__original');
  const replacement = mutation.querySelector<HTMLElement>('.memory-mutation__replacement');
  if (!original || !replacement) return;

  const replacementText = replacement.textContent ?? '';
  // Keep the erased sentence's footprint until the new recollection has
  // appeared. Otherwise a shorter replacement makes the dark wipe collapse
  // midway through the correction.
  mutation.style.inlineSize = `${mutation.getBoundingClientRect().width}px`;
  mutation.classList.remove('is-rewritten');
  mutation.classList.add('is-anime-controlled');
  replacement.style.opacity = '0';

  const effect = createTimeline({
    defaults: { ease: 'inOut(3)' },
    onComplete: () => {
      original.textContent = replacementText;
      original.style.opacity = '1';
      original.style.filter = 'blur(0px)';
      original.style.removeProperty('transform');
      original.style.removeProperty('clip-path');
      original.style.removeProperty('text-shadow');
      mutation.style.removeProperty('inline-size');
      mutation.classList.add('is-text-effect-settled');
    },
  })
    .add(original, {
      opacity: [1, 0.12],
      filter: ['blur(0px)', 'blur(0.9px)'],
      textShadow: [
        '0 0 0 rgba(119, 165, 207, 0)',
        '-0.08em 0 rgba(119, 165, 207, 0.16)',
      ],
      duration: 560,
    }, 520)
    .call(() => {
      original.textContent = replacementText;
      mutation.classList.add('is-rewritten');
      original.style.opacity = '0';
      original.style.filter = 'blur(1.15px)';
      original.style.clipPath = 'inset(0 100% 0 0)';
    }, 1090)
    .add(original, {
      opacity: [0, 1],
      filter: ['blur(1.15px)', 'blur(0px)'],
      clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
      textShadow: [
        '0 0 0 rgba(119, 165, 207, 0)',
        '0 0 0.38rem rgba(119, 165, 207, 0.06)',
      ],
      duration: 820,
      ease: 'out(5)',
    }, 1100)
    .init();

  trackEffect(line, effect);
}

function playAlternateEffect(line: HTMLElement, mutation: HTMLElement): void {
  const original = mutation.querySelector<HTMLElement>('.memory-mutation__original');
  const replacement = mutation.querySelector<HTMLElement>('.memory-mutation__replacement');
  if (!original || !replacement) return;

  const originalText = original.textContent ?? '';
  const replacementText = replacement.textContent ?? '';
  mutation.classList.add('is-anime-controlled');
  replacement.style.opacity = '0';

  // The two real readings take turns without cipher-like filler characters.
  // The recollection finally returns to its first wording, but keeps a faint
  // uncertain tint.
  const effect = createTimeline({
    defaults: { ease: 'inOut(3)' },
    onComplete: () => {
      original.textContent = originalText;
      original.style.opacity = '0.88';
      original.style.filter = 'blur(0px)';
      original.style.transform = 'translate(0, 0)';
      original.style.removeProperty('text-shadow');
      mutation.classList.add('is-text-effect-settled');
    },
  })
    .add(original, {
      opacity: [1, 0.08],
      x: ['0em', '-0.08em'],
      filter: ['blur(0px)', 'blur(0.85px)'],
      duration: 440,
    }, 520)
    .call(() => {
      original.textContent = replacementText;
      original.style.opacity = '0';
      original.style.transform = 'translateX(0.08em)';
    }, 970)
    .add(original, {
      opacity: [0, 0.94],
      x: ['0.08em', '0em'],
      filter: ['blur(0.9px)', 'blur(0px)'],
      textShadow: [
        '0.07em 0 rgba(119, 165, 207, 0.14)',
        '0 0 0 rgba(119, 165, 207, 0)',
      ],
      duration: 620,
      ease: 'out(5)',
    }, 980)
    .add(original, {
      opacity: [0.94, 0.08],
      x: ['0em', '0.06em'],
      filter: ['blur(0px)', 'blur(0.75px)'],
      duration: 420,
    }, 1810)
    .call(() => {
      original.textContent = originalText;
      original.style.opacity = '0';
      original.style.transform = 'translateX(-0.05em)';
    }, 2240)
    .add(original, {
      opacity: [0, 0.88],
      x: ['-0.05em', '0em'],
      filter: ['blur(0.7px)', 'blur(0px)'],
      duration: 680,
      ease: 'out(5)',
    }, 2250)
    .init();

  trackEffect(line, effect);
}

function playBluespaceCorrection(line: HTMLElement, text: HTMLElement): void {
  prepareGeneratedMemoryEffect(line, text, 'correction');
  const { chars } = splitText(text, {
    chars: { class: 'memory-char memory-char--probability' },
  });

  const effect = createTimeline({
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(chars, {
      opacity: [0.12, 0.56],
      x: () => `${randomBetween(-8, 8)}px`,
      y: () => `${randomBetween(-3.4, 3.4)}px`,
      rotate: () => `${randomBetween(-2.4, 2.4)}deg`,
      filter: ['blur(2.2px)', 'blur(0.7px)'],
      textShadow: '0 0 0.75rem rgba(94, 160, 225, 0.34)',
      duration: 480,
      delay: stagger(18, { from: 'random' }),
      ease: 'out(2)',
    }, 360)
    .add(chars, {
      opacity: 1,
      x: '0px',
      y: '0px',
      rotate: '0deg',
      filter: 'blur(0px)',
      textShadow: '0 0 0 rgba(94, 160, 225, 0)',
      duration: 720,
      delay: stagger(13, { from: 'center' }),
      ease: 'out(5)',
    }, 760)
    .init();

  trackEffect(line, effect);
}

function playCausalGap(line: HTMLElement, text: HTMLElement): void {
  prepareGeneratedMemoryEffect(line, text, 'causal-gap');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--unsupported' },
  });
  const unsupportedWords = words.slice(Math.max(0, words.length - Math.max(2, Math.ceil(words.length / 3))));

  const effect = createTimeline({
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(unsupportedWords, {
      opacity: [1, 0.08],
      x: [0, () => `${randomBetween(2.5, 6)}px`],
      y: [0, () => `${randomBetween(-1.8, 1.8)}px`],
      filter: ['blur(0px)', 'blur(2.8px)'],
      duration: 520,
      delay: stagger(75, { from: 'last' }),
      ease: 'in(3)',
    }, 520)
    .add(unsupportedWords, {
      opacity: [0.08, 0.48, 1],
      x: '0px',
      y: '0px',
      filter: ['blur(2.8px)', 'blur(0.55px)', 'blur(0px)'],
      duration: 880,
      delay: stagger(55, { from: 'first' }),
      ease: 'out(4)',
    }, 1070)
    .init();

  trackEffect(line, effect);
}

function playMemoryAssembly(line: HTMLElement, text: HTMLElement): void {
  const source = prepareGeneratedMemoryEffect(line, text, 'assembly');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--assembly' },
  });
  const leftEcho = createMemoryEcho(text, source, 'memory-anime-echo--cold');
  const rightEcho = createMemoryEcho(text, source, 'memory-anime-echo--pale');

  const effect = createTimeline({
    defaults: { ease: 'out(4)' },
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(leftEcho, {
      opacity: [0, 0.34, 0],
      x: ['-0.32em', '0em'],
      y: ['0.055em', '0em'],
      filter: ['blur(1.2px)', 'blur(0px)'],
      duration: 1080,
    }, 320)
    .add(rightEcho, {
      opacity: [0, 0.25, 0],
      x: ['0.38em', '0em'],
      y: ['-0.045em', '0em'],
      filter: ['blur(1.4px)', 'blur(0px)'],
      duration: 1180,
    }, 360)
    .add(words, {
      opacity: [0.6, 1],
      x: [() => `${randomBetween(-2.4, 2.4)}px`, '0px'],
      filter: ['blur(0.8px)', 'blur(0px)'],
      textShadow: ['0 0 0.65rem rgba(109, 164, 214, 0.2)', '0 0 0 rgba(109, 164, 214, 0)'],
      duration: 820,
      delay: stagger(45, { from: 'center' }),
    }, 560)
    .init();

  trackEffect(line, effect);
}

function playMemoryRejection(line: HTMLElement, text: HTMLElement, spatial: boolean): void {
  const source = prepareGeneratedMemoryEffect(line, text, 'rejection');
  const leftEcho = createMemoryEcho(text, source, 'memory-anime-echo--cold');
  const rightEcho = createMemoryEcho(text, source, 'memory-anime-echo--conflict');
  const distance = spatial ? 0.54 : 0.34;

  const effect = createTimeline({
    defaults: { ease: 'inOut(3)' },
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add([leftEcho, rightEcho], {
      opacity: [0, 0.3],
      duration: 260,
    }, 420)
    .add(leftEcho, {
      opacity: [0.3, 0.18, 0],
      x: ['0em', `-${distance}em`],
      y: ['0em', '0.085em'],
      filter: ['blur(0px)', 'blur(1.35px)'],
      duration: 1050,
    }, 630)
    .add(rightEcho, {
      opacity: [0.26, 0.15, 0],
      x: ['0em', `${distance}em`],
      y: ['0em', '-0.07em'],
      filter: ['blur(0px)', 'blur(1.2px)'],
      duration: 1120,
    }, 650)
    .add(text, {
      x: [0, -1.4, 1.1, -0.45, 0],
      filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)'],
      textShadow: [
        '0 0 0 rgba(116, 160, 207, 0)',
        '-0.09em 0 rgba(111, 158, 205, 0.18), 0.08em 0 rgba(171, 91, 91, 0.1)',
        '0 0 0 rgba(116, 160, 207, 0)',
      ],
      duration: 1050,
      ease: 'out(3)',
    }, 520)
    .init();

  trackEffect(line, effect);
}

function playForcedAnchor(line: HTMLElement, text: HTMLElement): void {
  prepareGeneratedMemoryEffect(line, text, 'forced');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--forced' },
  });

  const effect = createTimeline({
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(words, {
      opacity: [0.38, 0.82],
      x: () => `${randomBetween(-7, 7)}px`,
      y: () => `${randomBetween(-2.5, 2.5)}px`,
      filter: ['blur(1.5px)', 'blur(0.35px)'],
      duration: 260,
      delay: stagger(32, { from: 'random' }),
      ease: 'inOut(2)',
    }, 430)
    .add(words, {
      opacity: 1,
      x: '0px',
      y: '0px',
      filter: 'blur(0px)',
      letterSpacing: ['0.025em', '0em'],
      duration: 190,
      delay: stagger(24, { from: 'center' }),
      ease: 'out(6)',
    }, 760)
    .add(text, {
      x: [0, -1.6, 0.8, 0],
      textShadow: [
        '0 0 0 rgba(112, 163, 211, 0)',
        '0 0 0.75rem rgba(112, 163, 211, 0.3)',
        '0 0 0 rgba(112, 163, 211, 0)',
      ],
      duration: 380,
      ease: 'out(4)',
    }, 930)
    .init();

  trackEffect(line, effect);
}

function playDecoratedForcedAnchor(line: HTMLElement, text: HTMLElement): void {
  const source = prepareGeneratedMemoryEffect(line, text, 'forced');
  const echo = createMemoryEcho(text, source, 'memory-anime-echo--cold');
  const effect = createTimeline({
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(echo, {
      opacity: [0, 0.34, 0],
      x: ['-0.42em', '0.16em', '0em'],
      filter: ['blur(1.2px)', 'blur(0px)'],
      duration: 920,
      ease: 'out(5)',
    }, 520)
    .add(text, {
      x: [0, 2.4, -1.2, 0],
      filter: ['blur(0px)', 'blur(0.55px)', 'blur(0px)'],
      textShadow: [
        '0 0 0 rgba(112, 163, 211, 0)',
        '0 0 0.8rem rgba(112, 163, 211, 0.3)',
        '0 0 0 rgba(112, 163, 211, 0)',
      ],
      duration: 520,
      ease: 'out(5)',
    }, 810)
    .init();
  trackEffect(line, effect);
}

function playPersistentFracture(line: HTMLElement, text: HTMLElement, severe: boolean): void {
  const source = prepareGeneratedMemoryEffect(line, text, severe ? 'fracture-severe' : 'fracture');
  const leftEcho = createMemoryEcho(text, source, 'memory-anime-echo--cold');
  const rightEcho = createMemoryEcho(text, source, 'memory-anime-echo--conflict');
  const distance = severe ? 0.34 : 0.18;

  const effect = createTimeline({
    defaults: { ease: severe ? steps(3) : 'inOut(2)' },
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(leftEcho, {
      opacity: [0, severe ? 0.36 : 0.25, 0.08, 0],
      x: ['0em', `-${distance}em`, `-${distance * 0.72}em`],
      y: ['0em', '0.035em'],
      filter: ['blur(0px)', `blur(${severe ? 0.7 : 0.35}px)`],
      duration: severe ? 1760 : 1420,
    }, 380)
    .add(rightEcho, {
      opacity: [0, severe ? 0.3 : 0.2, 0.07, 0],
      x: ['0em', `${distance}em`, `${distance * 0.78}em`],
      y: ['0em', '-0.032em'],
      filter: ['blur(0px)', `blur(${severe ? 0.75 : 0.4}px)`],
      duration: severe ? 1820 : 1490,
    }, 420)
    .add(text, {
      x: severe ? [0, -2.2, 1.8, -0.8, 0] : [0, -0.8, 0.65, 0],
      y: severe ? [0, 0.5, -0.35, 0] : 0,
      filter: severe ? ['blur(0px)', 'blur(0.7px)', 'blur(0px)'] : ['blur(0px)', 'blur(0.2px)', 'blur(0px)'],
      duration: severe ? 1340 : 1040,
    }, 500)
    .init();

  trackEffect(line, effect);
}

function playMemoryFlicker(line: HTMLElement, text: HTMLElement): void {
  prepareGeneratedMemoryEffect(line, text, 'flicker');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--flicker' },
  });
  const effect = animate(words, {
    opacity: [1, 0.16, 0.82, 0.36, 1],
    filter: ['blur(0px)', 'blur(1.6px)', 'blur(0px)'],
    duration: 760,
    delay: stagger(46, { from: 'random' }),
    ease: steps(4),
    onComplete: () => settleGeneratedMemoryEffect(line),
  });
  trackEffect(line, effect);
}

function playPerfectLock(line: HTMLElement, text: HTMLElement, unnatural: boolean): void {
  prepareGeneratedMemoryEffect(line, text, unnatural ? 'perfect-unnatural' : 'perfect');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--perfect' },
  });
  const effect = createTimeline({
    defaults: { ease: 'out(5)' },
    onComplete: () => settleGeneratedMemoryEffect(line),
  })
    .add(words, {
      opacity: [0.55, 1],
      x: ['0.08em', '0em'],
      filter: ['blur(0.5px)', 'blur(0px)'],
      duration: 540,
      delay: stagger(62, { from: 'first' }),
    }, 440)
    .add(text, {
      letterSpacing: [unnatural ? '0.035em' : '0.018em', '0em'],
      textShadow: [
        '0 0 0.7rem rgba(118, 173, 218, 0.2)',
        '0 0 0.16rem rgba(118, 173, 218, 0.05)',
      ],
      duration: 720,
    }, 760)
    .init();
  trackEffect(line, effect);
}

function playPartialStability(line: HTMLElement, text: HTMLElement): void {
  prepareGeneratedMemoryEffect(line, text, 'partial');
  const { words } = splitText(text, {
    words: { class: 'memory-word memory-word--partial' },
  });
  const effect = animate(words, {
    opacity: [0.62, 1],
    x: [() => `${randomBetween(-2.2, 2.2)}px`, () => `${randomBetween(-0.35, 0.35)}px`],
    y: [() => `${randomBetween(-1.1, 1.1)}px`, '0px'],
    filter: ['blur(0.65px)', 'blur(0px)'],
    duration: 1280,
    delay: stagger(58, { from: 'first' }),
    ease: 'out(4)',
    onComplete: () => settleGeneratedMemoryEffect(line),
  });
  trackEffect(line, effect);
}

function prepareGeneratedMemoryEffect(line: HTMLElement, text: HTMLElement, kind: string): string {
  const source = text.textContent ?? '';
  line.classList.add('is-anime-memory-effect');
  line.dataset.animeMemoryEffect = kind;
  text.classList.add('is-anime-memory-target');
  return source;
}

function createMemoryEcho(text: HTMLElement, source: string, className: string): HTMLElement {
  const echo = document.createElement('span');
  echo.className = `memory-anime-echo ${className}`;
  echo.textContent = source;
  echo.setAttribute('aria-hidden', 'true');
  text.appendChild(echo);
  return echo;
}

function settleGeneratedMemoryEffect(line: HTMLElement): void {
  for (const echo of line.querySelectorAll('.memory-anime-echo')) echo.remove();
  for (const target of line.querySelectorAll<HTMLElement>('.is-anime-memory-target')) {
    target.style.removeProperty('transform');
    target.style.removeProperty('filter');
    target.style.removeProperty('text-shadow');
    target.style.removeProperty('letter-spacing');
  }
  for (const part of line.querySelectorAll<HTMLElement>('.memory-char, .memory-word')) {
    part.style.removeProperty('transform');
    part.style.removeProperty('opacity');
    part.style.removeProperty('filter');
    part.style.removeProperty('text-shadow');
    part.style.removeProperty('letter-spacing');
  }
  line.classList.add('is-anime-memory-settled');
}

function trackEffect(line: HTMLElement, effect: Timer): void {
  let effects = runningEffects.get(line);
  if (!effects) {
    effects = new Set<Timer>();
    runningEffects.set(line, effects);
  }
  effects.add(effect);
  void effect.then(() => effects?.delete(effect));
}

function randomBetween(minimum: number, maximum: number): number {
  return minimum + Math.random() * (maximum - minimum);
}

function getTextTarget(line: HTMLElement): HTMLElement | null {
  return line.querySelector<HTMLElement>(':scope > .line__text, :scope > .dialogue__text');
}
