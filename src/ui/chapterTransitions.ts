export type ScreenState = 'chapter_menu' | 'opening_bar' | 'chapter_02_fight';

export type TransitionVisual = 'to-menu' | 'to-bar' | 'to-fight' | 'fracture';

export const CHAPTER_TRANSITION = {
  fadeInMs: 760,
  holdMs: 320,
  fadeOutMs: 920,
  barFadeOutMs: 3200,
  scoreFadeOutMs: 3000,
  barFadeInMs: 3200,
  menuPauseMs: 1800,
} as const;

export function resolveTransitionVisual(
  from: ScreenState,
  to: ScreenState,
  _activeChapter: 1 | 2,
): TransitionVisual {
  if (to === 'chapter_menu') return 'to-menu';
  if (to === 'chapter_02_fight') {
    return from === 'opening_bar' ? 'fracture' : 'to-fight';
  }
  return 'to-bar';
}

export function shouldPlayMemoryRealign(visual: TransitionVisual): boolean {
  return visual === 'to-menu';
}
