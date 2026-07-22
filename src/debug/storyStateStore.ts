export type ChapterState = {
  unlocked: boolean;
  started: boolean;
  completed: boolean;
};

export type Chapter01Choices = {
  cigarette_state: 'untouched' | 'smoked' | 'ashed';
  caught_can: boolean;
  boasted_catch: boolean;
  job_answer: 'downsized' | 'fired' | 'deflected';
  theft_answer: 'honest' | 'almost' | 'euphemism';
  smoked_edward: boolean;
  fight_answer: 'self' | 'other' | 'unknown';
  city_attitude: 'home' | 'hole' | 'escape';
};

export type Chapter02Choices = {
  visitor_identity: 'unset' | 'worker' | 'collector' | 'stranger';
  visitor_motive: 'unset' | 'inventory' | 'debt' | 'nothing';
  selected_first: 'self' | 'other' | 'unknown';
  selected_can: 'hand' | 'floor' | 'kick';
  selected_edward: 'intervened' | 'door' | 'absent';
  selected_response: 'bottle' | 'hold' | 'evade';
  final_fight_answer: 'self' | 'other' | 'unknown' | 'repeated';
};

export type NotebookDebugView = {
  mode: 'normal' | 'clean' | 'full' | 'structure' | 'summaries' | 'lore';
  disableAnimations: boolean;
  revealAllText: boolean;
};

export type StoryDebugState = {
  stateVersion: 1;
  chapters: {
    chapter01: ChapterState;
    chapter02: ChapterState;
  };
  choices: {
    chapter01: Chapter01Choices;
    chapter02: Chapter02Choices;
  };
  memory: {
    doubt: number;
    delusion: number;
    fracture: number;
    memory_strain: number;
    identity_conflict: boolean;
    motive_conflict: boolean;
    edward_conflict: boolean;
  };
  notebookView: NotebookDebugView;
  ignoreChapterDependencies: boolean;
  seed: string;
};

export type StoryDebugPreset =
  | 'empty'
  | 'chapter01-started'
  | 'chapter01-random'
  | 'chapter01-custom'
  | 'chapter02-open'
  | 'chapter02-started'
  | 'both-complete'
  | 'full';

export type ImportResult = {
  state: StoryDebugState;
  corrections: string[];
};

const CHAPTER_01_DEFAULTS: Chapter01Choices = {
  cigarette_state: 'untouched',
  caught_can: true,
  boasted_catch: false,
  job_answer: 'downsized',
  theft_answer: 'almost',
  smoked_edward: false,
  fight_answer: 'unknown',
  city_attitude: 'home',
};

const CHAPTER_02_DEFAULTS: Chapter02Choices = {
  visitor_identity: 'unset',
  visitor_motive: 'unset',
  selected_first: 'unknown',
  selected_can: 'hand',
  selected_edward: 'intervened',
  selected_response: 'evade',
  final_fight_answer: 'unknown',
};

export function createDefaultDebugState(seed = createSeed()): StoryDebugState {
  return {
    stateVersion: 1,
    chapters: {
      chapter01: { unlocked: true, started: false, completed: false },
      chapter02: { unlocked: false, started: false, completed: false },
    },
    choices: {
      chapter01: { ...CHAPTER_01_DEFAULTS },
      chapter02: { ...CHAPTER_02_DEFAULTS },
    },
    memory: {
      doubt: 0,
      delusion: 0,
      fracture: 0,
      memory_strain: 0,
      identity_conflict: false,
      motive_conflict: false,
      edward_conflict: false,
    },
    notebookView: { mode: 'normal', disableAnimations: false, revealAllText: false },
    ignoreChapterDependencies: false,
    seed,
  };
}

export class StoryStateStore {
  private state: StoryDebugState;
  private listeners = new Set<(state: StoryDebugState) => void>();

  public constructor(
    private readonly storageKey: string,
    initialState: StoryDebugState = createDefaultDebugState(),
  ) {
    this.state = this.readStoredState(initialState);
  }

  public getState(): StoryDebugState {
    return structuredClone(this.state);
  }

  public setState(next: StoryDebugState): ImportResult {
    const result = validateStoryDebugState(next);
    this.state = result.state;
    this.persist();
    this.emit();
    return result;
  }

  public hydrateState(next: StoryDebugState): ImportResult {
    const result = validateStoryDebugState(next);
    this.state = result.state;
    this.emit();
    return result;
  }

  public patchState(mutator: (draft: StoryDebugState) => void): ImportResult {
    const next = this.getState();
    mutator(next);
    return this.setState(next);
  }

  public resetState(): StoryDebugState {
    this.state = createDefaultDebugState();
    this.persist();
    this.emit();
    return this.getState();
  }

  public applyPreset(preset: StoryDebugPreset): StoryDebugState {
    const previous = this.getState();
    const next = createDefaultDebugState(previous.seed);

    if (preset === 'chapter01-started') {
      next.chapters.chapter01.started = true;
    } else if (preset === 'chapter01-random') {
      next.chapters.chapter01 = { unlocked: true, started: true, completed: true };
      next.chapters.chapter02.unlocked = true;
      next.choices.chapter01 = randomizeChapter01(next.seed);
    } else if (preset === 'chapter01-custom' || preset === 'chapter02-open') {
      next.chapters.chapter01 = { unlocked: true, started: true, completed: true };
      next.chapters.chapter02.unlocked = true;
      next.choices.chapter01 = { ...previous.choices.chapter01 };
    } else if (preset === 'chapter02-started') {
      next.chapters.chapter01 = { unlocked: true, started: true, completed: true };
      next.chapters.chapter02 = { unlocked: true, started: true, completed: false };
      next.choices.chapter01 = { ...previous.choices.chapter01 };
    } else if (preset === 'both-complete' || preset === 'full') {
      next.chapters.chapter01 = { unlocked: true, started: true, completed: true };
      next.chapters.chapter02 = { unlocked: true, started: true, completed: true };
      next.choices.chapter01 = randomizeChapter01(`${next.seed}:01`);
      const randomized = randomizeChapter02(`${next.seed}:02`);
      next.choices.chapter02 = randomized.choices;
      next.memory = randomized.memory;
      if (preset === 'full') {
        next.notebookView.mode = 'full';
      }
    }

    this.setState(next);
    return this.getState();
  }

  public randomizeChapter(chapter: 1 | 2): StoryDebugState {
    return this.patchState((draft) => {
      if (chapter === 1) {
        draft.choices.chapter01 = randomizeChapter01(`${draft.seed}:01`);
      } else {
        const randomized = randomizeChapter02(`${draft.seed}:02`);
        draft.choices.chapter02 = randomized.choices;
        draft.memory = randomized.memory;
      }
    }).state;
  }

  public exportState(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importState(raw: string): ImportResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('JSON не удалось прочитать.');
    }
    return this.setState(parsed as StoryDebugState);
  }

  public subscribe(listener: (state: StoryDebugState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public clearOverride(): void {
    localStorage.removeItem(this.storageKey);
    this.state = createDefaultDebugState();
    this.emit();
  }

  public static createSeed(): string {
    return createSeed();
  }

  private readStoredState(initialState: StoryDebugState): StoryDebugState {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return validateStoryDebugState(initialState).state;
    try {
      return validateStoryDebugState(JSON.parse(raw)).state;
    } catch {
      return createDefaultDebugState();
    }
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  private emit(): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) listener(snapshot);
  }
}

export function validateStoryDebugState(input: unknown): ImportResult {
  const corrections: string[] = [];
  const fallback = createDefaultDebugState();
  const source = isRecord(input) ? input : {};
  if (!isRecord(input)) corrections.push('Корневое значение заменено состоянием по умолчанию.');
  for (const key of Object.keys(source)) {
    if (!['stateVersion', 'chapters', 'choices', 'memory', 'notebookView', 'ignoreChapterDependencies', 'seed'].includes(key)) {
      corrections.push(`Неизвестное поле ${key} проигнорировано.`);
    }
  }
  if (source.stateVersion !== undefined && source.stateVersion !== 1) {
    corrections.push(`stateVersion ${String(source.stateVersion)} преобразован в 1.`);
  }

  const chapters = isRecord(source.chapters) ? source.chapters : {};
  const choices = isRecord(source.choices) ? source.choices : {};
  const chapter01Choices = isRecord(choices.chapter01) ? choices.chapter01 : {};
  const chapter02Choices = isRecord(choices.chapter02) ? choices.chapter02 : {};
  const memory = isRecord(source.memory) ? source.memory : {};
  const notebook = isRecord(source.notebookView) ? source.notebookView : {};

  const state: StoryDebugState = {
    stateVersion: 1,
    chapters: {
      chapter01: readChapterState(chapters.chapter01, fallback.chapters.chapter01, corrections, 'I'),
      chapter02: readChapterState(chapters.chapter02, fallback.chapters.chapter02, corrections, 'II'),
    },
    choices: {
      chapter01: {
        cigarette_state: readEnum(chapter01Choices.cigarette_state, ['untouched', 'smoked', 'ashed'], 'untouched', corrections, 'cigarette_state'),
        caught_can: readBoolean(chapter01Choices.caught_can, true, corrections, 'caught_can'),
        boasted_catch: readBoolean(chapter01Choices.boasted_catch, false, corrections, 'boasted_catch'),
        job_answer: readEnum(chapter01Choices.job_answer, ['downsized', 'fired', 'deflected'], 'downsized', corrections, 'job_answer'),
        theft_answer: readEnum(chapter01Choices.theft_answer, ['honest', 'almost', 'euphemism'], 'almost', corrections, 'theft_answer'),
        smoked_edward: readBoolean(chapter01Choices.smoked_edward, false, corrections, 'smoked_edward'),
        fight_answer: readEnum(chapter01Choices.fight_answer, ['self', 'other', 'unknown'], 'unknown', corrections, 'fight_answer'),
        city_attitude: readEnum(chapter01Choices.city_attitude, ['home', 'hole', 'escape'], 'home', corrections, 'city_attitude'),
      },
      chapter02: {
        visitor_identity: readEnum(chapter02Choices.visitor_identity, ['unset', 'worker', 'collector', 'stranger'], 'unset', corrections, 'visitor_identity'),
        visitor_motive: readEnum(chapter02Choices.visitor_motive, ['unset', 'inventory', 'debt', 'nothing'], 'unset', corrections, 'visitor_motive'),
        selected_first: readEnum(chapter02Choices.selected_first, ['self', 'other', 'unknown'], 'unknown', corrections, 'selected_first'),
        selected_can: readEnum(chapter02Choices.selected_can, ['hand', 'floor', 'kick'], 'hand', corrections, 'selected_can'),
        selected_edward: readEnum(chapter02Choices.selected_edward, ['intervened', 'door', 'absent'], 'intervened', corrections, 'selected_edward'),
        selected_response: readEnum(chapter02Choices.selected_response, ['bottle', 'hold', 'evade'], 'evade', corrections, 'selected_response'),
        final_fight_answer: readEnum(chapter02Choices.final_fight_answer, ['self', 'other', 'unknown', 'repeated'], 'unknown', corrections, 'final_fight_answer'),
      },
    },
    memory: {
      doubt: readScore(memory.doubt, corrections, 'doubt'),
      delusion: readScore(memory.delusion, corrections, 'delusion'),
      fracture: readScore(memory.fracture, corrections, 'fracture'),
      memory_strain: readScore(memory.memory_strain, corrections, 'memory_strain'),
      identity_conflict: readBoolean(memory.identity_conflict, false, corrections, 'identity_conflict'),
      motive_conflict: readBoolean(memory.motive_conflict, false, corrections, 'motive_conflict'),
      edward_conflict: readBoolean(memory.edward_conflict, false, corrections, 'edward_conflict'),
    },
    notebookView: {
      mode: readEnum(notebook.mode, ['normal', 'clean', 'full', 'structure', 'summaries', 'lore'], 'normal', corrections, 'notebookView.mode'),
      disableAnimations: readBoolean(notebook.disableAnimations, false, corrections, 'disableAnimations'),
      revealAllText: readBoolean(notebook.revealAllText, false, corrections, 'revealAllText'),
    },
    ignoreChapterDependencies: readBoolean(source.ignoreChapterDependencies, false, corrections, 'ignoreChapterDependencies'),
    seed: typeof source.seed === 'string' && source.seed.trim() ? source.seed.trim() : fallback.seed,
  };

  normalizeChapterDependencies(state, corrections);
  return { state, corrections };
}

function normalizeChapterDependencies(state: StoryDebugState, corrections: string[]): void {
  for (const [label, chapter] of [['I', state.chapters.chapter01], ['II', state.chapters.chapter02]] as const) {
    if (chapter.completed && (!chapter.started || !chapter.unlocked)) {
      chapter.started = true;
      chapter.unlocked = true;
      corrections.push(`Глава ${label}: завершённая глава автоматически открыта и начата.`);
    } else if (chapter.started && !chapter.unlocked) {
      chapter.unlocked = true;
      corrections.push(`Глава ${label}: начатая глава автоматически открыта.`);
    }
  }
  state.chapters.chapter01.unlocked = true;
  if (!state.ignoreChapterDependencies && !state.chapters.chapter01.completed) {
    if (state.chapters.chapter02.unlocked || state.chapters.chapter02.started || state.chapters.chapter02.completed) {
      corrections.push('Глава II закрыта, потому что глава I не завершена.');
    }
    state.chapters.chapter02 = { unlocked: false, started: false, completed: false };
  }
}

function randomizeChapter01(seed: string): Chapter01Choices {
  const random = seededRandom(seed);
  return {
    cigarette_state: pick(random, ['untouched', 'smoked', 'ashed'] as const),
    caught_can: random() >= 0.5,
    boasted_catch: random() >= 0.5,
    job_answer: pick(random, ['downsized', 'fired', 'deflected'] as const),
    theft_answer: pick(random, ['honest', 'almost', 'euphemism'] as const),
    smoked_edward: random() >= 0.5,
    fight_answer: pick(random, ['self', 'other', 'unknown'] as const),
    city_attitude: pick(random, ['home', 'hole', 'escape'] as const),
  };
}

function randomizeChapter02(seed: string): { choices: Chapter02Choices; memory: StoryDebugState['memory'] } {
  const random = seededRandom(seed);
  const outcome = pick(random, ['normal', 'collapse', 'perfect'] as const);
  const conflicts = {
    memory_strain: integer(random, 0, 5),
    identity_conflict: random() >= 0.5,
    motive_conflict: random() >= 0.5,
    edward_conflict: random() >= 0.5,
  };
  const memory = outcome === 'collapse'
    ? { doubt: integer(random, 0, 5), delusion: integer(random, 0, 5), fracture: integer(random, 3, 5), ...conflicts }
    : outcome === 'perfect'
      ? { doubt: integer(random, 0, 5), delusion: integer(random, 3, 5), fracture: integer(random, 0, 2), ...conflicts }
      : { doubt: integer(random, 0, 5), delusion: integer(random, 0, 2), fracture: integer(random, 0, 2), ...conflicts };
  return {
    choices: {
      visitor_identity: pick(random, ['worker', 'collector', 'stranger'] as const),
      visitor_motive: pick(random, ['inventory', 'debt', 'nothing'] as const),
      selected_first: pick(random, ['self', 'other', 'unknown'] as const),
      selected_can: pick(random, ['hand', 'floor', 'kick'] as const),
      selected_edward: pick(random, ['intervened', 'door', 'absent'] as const),
      selected_response: pick(random, ['bottle', 'hold', 'evade'] as const),
      final_fight_answer: pick(random, ['self', 'other', 'unknown', 'repeated'] as const),
    },
    memory,
  };
}

function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)]!;
}

function integer(random: () => number, minimum: number, maximum: number): number {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function createSeed(): string {
  return `fight-${Math.floor(Math.random() * 90000 + 10000)}`;
}

function readChapterState(value: unknown, fallback: ChapterState, corrections: string[], label: string): ChapterState {
  if (!isRecord(value)) {
    corrections.push(`Глава ${label}: использовано состояние по умолчанию.`);
    return { ...fallback };
  }
  return {
    unlocked: readBoolean(value.unlocked, fallback.unlocked, corrections, `chapter${label}.unlocked`),
    started: readBoolean(value.started, fallback.started, corrections, `chapter${label}.started`),
    completed: readBoolean(value.completed, fallback.completed, corrections, `chapter${label}.completed`),
  };
}

function readBoolean(value: unknown, fallback: boolean, corrections: string[], field: string): boolean {
  if (typeof value === 'boolean') return value;
  if (value !== undefined) corrections.push(`${field}: использовано значение по умолчанию.`);
  return fallback;
}

function readScore(value: unknown, corrections: string[], field: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = Math.max(0, Math.min(5, Math.round(value)));
    if (normalized !== value) corrections.push(`${field}: значение ограничено диапазоном 0–5.`);
    return normalized;
  }
  if (value !== undefined) corrections.push(`${field}: использован 0.`);
  return 0;
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T, corrections: string[], field: string): T {
  if (typeof value === 'string' && allowed.includes(value as T)) return value as T;
  if (value !== undefined) corrections.push(`${field}: неизвестное значение заменено на ${fallback}.`);
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
