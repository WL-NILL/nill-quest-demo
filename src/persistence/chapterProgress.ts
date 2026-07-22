export const CHAPTER_PROGRESS_SCHEMA_VERSION = 4;

export type ChapterVariableValue = string | number | boolean | null;
export type ChapterVariables = Record<string, ChapterVariableValue>;

export type ChapterProgress = {
  schemaVersion: number;
  startedChapters: number[];
  completedChapters: number[];
  unlockedChapters: number[];
  chapter1Variables: ChapterVariables;
  chapter2Variables: ChapterVariables;
};

export function createInitialChapterProgress(): ChapterProgress {
  return {
    schemaVersion: CHAPTER_PROGRESS_SCHEMA_VERSION,
    startedChapters: [],
    completedChapters: [],
    unlockedChapters: [1],
    chapter1Variables: {},
    chapter2Variables: {},
  };
}

export class ChapterProgressManager {
  public constructor(private readonly storageKey: string) {}

  public load(): ChapterProgress {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return createInitialChapterProgress();

    try {
      const parsed = JSON.parse(raw) as Partial<ChapterProgress> & {
        chapter1Completed?: boolean;
        chapter2Unlocked?: boolean;
      };

      // Preserve chapter unlocks created by the first version of the menu.
      if (parsed.schemaVersion === 1) {
        return {
          schemaVersion: CHAPTER_PROGRESS_SCHEMA_VERSION,
          startedChapters: parsed.chapter1Completed ? [1] : [],
          completedChapters: parsed.chapter1Completed ? [1] : [],
          unlockedChapters: parsed.chapter2Unlocked ? [1, 2] : [1],
          chapter1Variables:
            parsed.chapter1Variables && typeof parsed.chapter1Variables === 'object'
              ? parsed.chapter1Variables
              : {},
          chapter2Variables: {},
        };
      }

      if (parsed.schemaVersion === 2) {
        const completedChapters = Array.isArray(parsed.completedChapters)
          ? parsed.completedChapters.filter(Number.isInteger)
          : [];
        return {
          schemaVersion: CHAPTER_PROGRESS_SCHEMA_VERSION,
          startedChapters: [...completedChapters],
          completedChapters,
          unlockedChapters: Array.isArray(parsed.unlockedChapters)
            ? parsed.unlockedChapters.filter(Number.isInteger)
            : [1],
          chapter1Variables:
            parsed.chapter1Variables && typeof parsed.chapter1Variables === 'object'
              ? parsed.chapter1Variables
              : {},
          chapter2Variables: {},
        };
      }

      if (parsed.schemaVersion === 3) {
        return {
          schemaVersion: CHAPTER_PROGRESS_SCHEMA_VERSION,
          startedChapters: Array.isArray(parsed.startedChapters)
            ? parsed.startedChapters.filter(Number.isInteger)
            : [],
          completedChapters: Array.isArray(parsed.completedChapters)
            ? parsed.completedChapters.filter(Number.isInteger)
            : [],
          unlockedChapters: Array.isArray(parsed.unlockedChapters)
            ? parsed.unlockedChapters.filter(Number.isInteger)
            : [1],
          chapter1Variables:
            parsed.chapter1Variables && typeof parsed.chapter1Variables === 'object'
              ? parsed.chapter1Variables
              : {},
          chapter2Variables: {},
        };
      }

      if (
        parsed.schemaVersion !== CHAPTER_PROGRESS_SCHEMA_VERSION ||
        !Array.isArray(parsed.startedChapters) ||
        !parsed.startedChapters.every(Number.isInteger) ||
        !Array.isArray(parsed.completedChapters) ||
        !parsed.completedChapters.every(Number.isInteger) ||
        !Array.isArray(parsed.unlockedChapters) ||
        !parsed.unlockedChapters.every(Number.isInteger) ||
        !parsed.chapter1Variables ||
        typeof parsed.chapter1Variables !== 'object' ||
        Array.isArray(parsed.chapter1Variables) ||
        !parsed.chapter2Variables ||
        typeof parsed.chapter2Variables !== 'object' ||
        Array.isArray(parsed.chapter2Variables)
      ) {
        return createInitialChapterProgress();
      }

      return parsed as ChapterProgress;
    } catch {
      return createInitialChapterProgress();
    }
  }

  public save(progress: ChapterProgress): void {
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
