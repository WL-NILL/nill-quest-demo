import { animate } from 'animejs/animation';
import { stagger } from 'animejs/utils';
import type { StoryChoice } from '../narrative/narrativeTypes';

export function renderChoices(
  container: HTMLElement,
  choices: StoryChoice[],
  onSelect: (index: number) => void,
  lockedIndex?: number,
): void {
  container.replaceChildren();

  for (const choice of choices) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.dataset.choiceKind = choice.kind;
    button.dataset.choiceIndex = String(choice.index);

    const label = document.createElement('span');
    label.className = 'choice-button__label';
    label.textContent = choice.text;
    button.appendChild(label);

    if (lockedIndex !== undefined) {
      const isRemembered = choice.index === lockedIndex;
      button.disabled = !isRemembered;
      button.classList.toggle('is-remembered', isRemembered);
      if (isRemembered) {
        button.setAttribute('aria-label', `${choice.text} Выбор уже сделан`);
      }
    }
    button.addEventListener('click', () => onSelect(choice.index));
    container.appendChild(button);
  }
}

export async function rewriteChoice(
  container: HTMLElement,
  choiceIndex: number,
  rewrittenText: string,
): Promise<void> {
  const selected = container.querySelector<HTMLButtonElement>(
    `.choice-button[data-choice-index="${choiceIndex}"]`,
  );
  if (!selected) return;

  container.classList.add('choices--reality-correcting');
  const buttons = [...container.querySelectorAll<HTMLButtonElement>('.choice-button')];
  for (const button of buttons) {
    button.disabled = true;
  }
  selected.setAttribute('aria-live', 'assertive');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rewriteOrder = shuffled(buttons);
  await Promise.all(rewriteOrder.map((button, position) =>
    rewriteButtonLabel(
      button,
      rewrittenText,
      reducedMotion ? 0 : position * 125 + randomBetween(20, 95),
      reducedMotion,
    ),
  ));
  selected.setAttribute('aria-label', `${rewrittenText} Версия исправлена`);
  await wait(reducedMotion ? 40 : 560);

  const discarded = buttons.filter((button) => button !== selected);
  for (const button of buttons) button.classList.remove('is-reality-duplicated');
  if (!reducedMotion) {
    animate(discarded, {
      opacity: [1, 0],
      x: () => `${randomBetween(-8, 8)}px`,
      y: () => `${randomBetween(-5, 5)}px`,
      rotate: () => `${randomBetween(-1.2, 1.2)}deg`,
      filter: ['blur(0px)', 'blur(6px)'],
      duration: () => randomBetween(460, 680),
      delay: stagger(75, { from: 'random' }),
      ease: 'in(2)',
    });
  } else {
    for (const button of discarded) button.classList.add('is-reality-removed');
  }
  selected.classList.add('is-reality-corrected');
  container.classList.add('choices--reality-merged');
  await wait(reducedMotion ? 30 : 820);

  for (const button of buttons) {
    if (button !== selected) button.hidden = true;
  }

  await wait(reducedMotion ? 60 : 360);
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

async function rewriteButtonLabel(
  button: HTMLButtonElement,
  rewrittenText: string,
  delayMs: number,
  reducedMotion: boolean,
): Promise<void> {
  const label = button.querySelector<HTMLElement>('.choice-button__label');
  if (!label) return;

  await wait(delayMs);
  button.classList.add('is-reality-correcting');

  if (!reducedMotion) {
    animate(label, {
      opacity: [1, 0.06],
      x: [0, randomBetween(-5, 5)],
      filter: ['blur(0px)', 'blur(2.6px)'],
      duration: randomBetween(190, 270),
      ease: 'in(3)',
    });
    await wait(280);
  }

  label.textContent = rewrittenText;
  button.classList.remove('is-reality-correcting');
  button.classList.add('is-reality-duplicated');

  if (!reducedMotion) {
    animate(label, {
      opacity: [0.08, 1],
      x: [randomBetween(-3.5, 3.5), 0],
      filter: ['blur(2.2px)', 'blur(0px)'],
      duration: randomBetween(360, 480),
      ease: 'out(4)',
    });
    await wait(490);
  }
}
