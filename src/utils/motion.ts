export interface StaggerOptions {
    baseMs?: number;
    stepMs: number;
    maxStaggered: number;
}

export const staggerDelayMs = (index: number, { baseMs = 0, stepMs, maxStaggered }: StaggerOptions): number =>
    baseMs + Math.min(index, maxStaggered) * stepMs;
