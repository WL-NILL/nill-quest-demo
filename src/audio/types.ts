export type MusicTrackId = 'fight_ambient' | 'fight_memory' | 'fight_aftermath';

export type MusicState = {
  enabled: boolean;
  masterVolume: number;
  currentTrack: MusicTrackId | null;
  currentSeek: number;
  targetVolume: number;
  isPlaying: boolean;
  isDucked: boolean;
  fractureOffsetMs: number;
};

export type MusicDebugState = MusicState & {
  effectiveVolume: number;
  primaryHowlId: number | null;
  secondaryHowlId: number | null;
  autoplayUnlocked: boolean;
  pendingMusicCommand: string | null;
  filter: string | null;
  recentCommands: string[];
};

export type MusicTrackDefinition = {
  src: string[];
  loop: boolean;
  defaultVolume: number;
};
