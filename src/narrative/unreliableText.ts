import type { NarrativeLine } from './narrativeTypes';

export type UnreliableState = {
  schemaVersion: number;
  runCount: number;
  seed: string;
  seenLineIds: string[];
  shownVariants: Record<string, string>;
  contradictionFlags: string[];
};

const SCHEMA_VERSION = 1;

function hashText(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return hash >>> 0;
}

function pickDeterministicVariant(key: string, variants: string[], seed: string): string {
  const index = hashText(`${seed}:${key}`) % variants.length;
  return variants[index] ?? variants[0];
}

const LINE_VARIANTS: Record<string, string[]> = {
  bar_repeat_02: [
    'На краю столешницы собралась тяжелая капля. Она дрогнула, вытянулась вниз и осталась висеть.',
    'На краю столешницы собралась тяжелая капля. Она качнулась и застыла, будто уже падала отсюда раньше.',
  ],
};

export function createInitialUnreliableState(): UnreliableState {
  return {
    schemaVersion: SCHEMA_VERSION,
    runCount: 1,
    seed: `run-${Date.now()}`,
    seenLineIds: [],
    shownVariants: {},
    contradictionFlags: [],
  };
}

export function nextRunState(previous: UnreliableState): UnreliableState {
  return {
    ...previous,
    runCount: previous.runCount + 1,
    seed: `${previous.seed}:r${previous.runCount + 1}`,
    seenLineIds: [],
  };
}

export function applyUnreliableVariant(
  line: NarrativeLine,
  state: UnreliableState,
): NarrativeLine {
  if (!line.lineId) {
    return line;
  }

  const variants = LINE_VARIANTS[line.lineId];
  if (!variants || variants.length === 0) {
    return line;
  }

  const remembered = state.shownVariants[line.lineId];
  const chosen = remembered ?? pickDeterministicVariant(line.lineId, variants, state.seed);

  state.shownVariants[line.lineId] = chosen;
  if (!state.seenLineIds.includes(line.lineId)) {
    state.seenLineIds.push(line.lineId);
  }

  return {
    ...line,
    text: chosen,
  };
}
