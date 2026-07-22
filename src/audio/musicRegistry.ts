import type { MusicTrackDefinition, MusicTrackId } from './types';

export const MUSIC_REGISTRY: Record<MusicTrackId, MusicTrackDefinition> = {
  fight_ambient: {
    src: [
      'audio/music/chapter-02-threshold.ogg',
      'audio/music/chapter-02-threshold.mp3',
    ],
    loop: true,
    defaultVolume: 0.28,
  },
  fight_memory: {
    src: [
      'audio/music/chapter-02-fight.ogg',
      'audio/music/chapter-02-fight.mp3',
    ],
    loop: true,
    defaultVolume: 0.38,
  },
  fight_aftermath: {
    src: [
      'audio/music/chapter-02-aftermath.ogg',
      'audio/music/chapter-02-aftermath.mp3',
    ],
    loop: true,
    defaultVolume: 0.18,
  },
};
