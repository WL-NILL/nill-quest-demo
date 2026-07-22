import type { AppSave } from './saveTypes';
import { SAVE_SCHEMA_VERSION } from './saveTypes';

export function migrateSave(input: unknown): AppSave | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const maybeSave = input as Partial<AppSave>;

  if (maybeSave.schemaVersion !== SAVE_SCHEMA_VERSION) {
    return null;
  }

  if (
    typeof maybeSave.storyStateJson !== 'string' ||
    !Array.isArray(maybeSave.transcript) ||
    !Array.isArray(maybeSave.pendingLines) ||
    !Array.isArray(maybeSave.pendingChoices) ||
    typeof maybeSave.pendingEnd !== 'boolean' ||
    typeof maybeSave.choiceIsLocked !== 'boolean' ||
    typeof maybeSave.musicMuted !== 'boolean' ||
    typeof maybeSave.musicStarted !== 'boolean' ||
    typeof maybeSave.palette !== 'string' ||
    !maybeSave.unreliableState
  ) {
    return null;
  }

  return maybeSave as AppSave;
}
