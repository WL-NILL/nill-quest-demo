import type { NarrativeLine } from './narrativeTypes';

type StoryTextCatalog = {
  revision: string;
  lines: Record<string, string>;
};

export async function loadStoryTextCatalog(sourceUrl: string): Promise<StoryTextCatalog | null> {
  try {
    const requestUrl = new URL(sourceUrl, window.location.href);
    requestUrl.searchParams.set('story-revision', String(Date.now()));
    const response = await fetch(requestUrl, { cache: 'no-store' });
    if (!response.ok) return null;
    const parsed = await response.json() as Partial<StoryTextCatalog>;
    if (!parsed.lines || typeof parsed.lines !== 'object') return null;
    return {
      revision: typeof parsed.revision === 'string' ? parsed.revision : '',
      lines: parsed.lines,
    };
  } catch {
    // A missing catalog must never block the story. Production builds made
    // before this feature simply keep the text stored in the save.
    return null;
  }
}

export function refreshSavedLines(
  savedLines: NarrativeLine[],
  catalog: StoryTextCatalog | null,
): NarrativeLine[] {
  if (!catalog) return savedLines;

  return savedLines.flatMap((line) => {
    if (!line.lineId) return [line];
    const currentText = catalog.lines[line.lineId];
    if (currentText === undefined) return [];
    return [{ ...line, text: currentText }];
  });
}

export function refreshSavedLine(
  savedLine: NarrativeLine | undefined,
  catalog: StoryTextCatalog | null,
): NarrativeLine | undefined {
  if (!savedLine || !catalog || !savedLine.lineId) return savedLine;
  const currentText = catalog.lines[savedLine.lineId];
  if (currentText === undefined) return undefined;
  return { ...savedLine, text: currentText };
}
