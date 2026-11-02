import { STAGES, type Bi, type Stage } from './types';

export const STAGE_LABELS: Record<Stage, Bi> = {
  polling: ['Opportunity polling', 'استطلاع الفرص'],
  recommended: ['Recommended', 'موصى بها'],
  writing: ['Proposal writing', 'كتابة العرض'],
  review: ['Revision and review', 'المراجعة'],
  sent: ['Sent proposals', 'تم الإرسال'],
  outcomes: ['Outcomes', 'النتائج'],
};

/** Same colours as the original dashboard. */
export const STAGE_COLORS: Record<Stage, string> = {
  polling: '#94A3B8',
  recommended: '#38BDF8',
  writing: '#0D9488',
  review: '#8B5CF6',
  sent: '#D97706',
  outcomes: '#064E4B',
};

export function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function nextStage(stage: Stage): Stage | null {
  return STAGES[stageIndex(stage) + 1] ?? null;
}

export function previousStage(stage: Stage): Stage | null {
  const i = stageIndex(stage);
  return i > 0 ? (STAGES[i - 1] ?? null) : null;
}
