import { migrateSave } from './migrations';
import type { AppSave } from './saveTypes';

export class SaveManager {
  public constructor(private readonly storageKey: string) {}

  public load(): AppSave | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return migrateSave(parsed);
    } catch {
      return null;
    }
  }

  public save(save: AppSave): void {
    localStorage.setItem(this.storageKey, JSON.stringify(save));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
