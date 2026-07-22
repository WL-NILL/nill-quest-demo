const PALETTE_CLASS_PREFIX = 'palette-';

export class PaletteManager {
  private activePalette = 'bar-warm';

  public constructor(private readonly root: HTMLElement) {
    this.root.classList.add(`${PALETTE_CLASS_PREFIX}${this.activePalette}`);
  }

  public setPalette(nextPalette: string): void {
    if (!nextPalette || nextPalette === this.activePalette) {
      return;
    }

    this.root.classList.remove(`${PALETTE_CLASS_PREFIX}${this.activePalette}`);
    this.activePalette = nextPalette;
    this.root.classList.add(`${PALETTE_CLASS_PREFIX}${nextPalette}`);
  }

  public getPalette(): string {
    return this.activePalette;
  }
}
