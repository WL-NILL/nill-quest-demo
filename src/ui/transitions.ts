import type { NarrativeLine } from '../narrative/narrativeTypes';

export async function waitForNarrativePause(line: NarrativeLine, reducedMotion: boolean): Promise<void> {
  if (reducedMotion || !line.tags.pause) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, line.tags.pause);
  });
}
