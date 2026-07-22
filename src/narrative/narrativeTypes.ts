export type NarrativeLayer = 'narration' | 'dialogue' | 'thought' | 'archive' | 'unknown';

export type NarrativeMark = {
  kind: 'conflict' | 'anchor' | 'uncertain';
  text: string;
};

export type NarrativeMutation = {
  kind: 'rewrite' | 'alternate' | 'split-word';
  from: string;
  to: string;
};

export type ParsedInkTags = {
  scene?: string;
  palette?: string;
  background?: string;
  speaker?: string;
  layer?: NarrativeLayer;
  lineId?: string;
  choiceId?: string;
  choiceRewrite?: string;
  tone?: string;
  fx?: string;
  visual?: string;
  memory?: string;
  pause?: number;
  pauseBefore?: number;
  music?: string[];
  sfx?: string;
  marks?: NarrativeMark[];
  mutations?: NarrativeMutation[];
  beatEnd?: boolean;
  debugChoiceSignificant?: boolean;
};

export type NarrativeLine = {
  text: string;
  layer: NarrativeLayer;
  speaker?: string;
  lineId?: string;
  tags: ParsedInkTags;
};

export type StoryChoice = {
  index: number;
  text: string;
  kind: 'dialogue' | 'action';
};

export type StoryTurn = {
  lines: NarrativeLine[];
  choices: StoryChoice[];
  scene?: string;
  palette?: string;
  background?: string;
  fx?: string;
  visual?: string;
  memory?: string;
  music?: string[];
  beatEnded: boolean;
  debugChoiceSignificant: boolean;
  choiceRewrite?: string;
};
