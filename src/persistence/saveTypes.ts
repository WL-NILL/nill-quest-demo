import type { NarrativeLine, StoryChoice } from '../narrative/narrativeTypes';
import type { UnreliableState } from '../narrative/unreliableText';
import type { MusicState } from '../audio/types';

export const SAVE_SCHEMA_VERSION = 8;

export type ChoiceCheckpoint = {
  checkpointId?: 'fight-impact';
  storyStateJson: string;
  transcript: NarrativeLine[];
  choices: StoryChoice[];
  selectedIndex?: number;
  musicState?: MusicState;
};

export type AppSave = {
  schemaVersion: number;
  activeChapter?: 1 | 2;
  screenState?: 'chapter_menu' | 'opening_bar' | 'chapter_02_fight';
  storyScrollTop?: {
    chapter1: number;
    chapter2: number;
  };
  storyStateJson: string;
  bufferedLine?: NarrativeLine;
  transcript: NarrativeLine[];
  pendingLines: NarrativeLine[];
  pendingChoices: StoryChoice[];
  pendingEnd: boolean;
  choiceCheckpoint?: ChoiceCheckpoint;
  fightMemoryCheckpoint?: ChoiceCheckpoint;
  choiceIsLocked: boolean;
  musicMuted: boolean;
  musicStarted: boolean;
  musicState?: MusicState;
  palette: string;
  unreliableState: UnreliableState;
};
