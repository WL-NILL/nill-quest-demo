export class MotionManager {
  private readonly reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  public isReduced(): boolean {
    return this.reducedMotionQuery.matches;
  }
}
