/**
 * Shared data model. Firestore layout:
 *
 *   users/{uid}                                      UserDoc
 *   opportunities/{oppId}                            Opportunity (server-written catalogue)
 *   organizations/{orgId}                            Organization
 *   organizations/{orgId}/members/{uid}              Membership
 *   organizations/{orgId}/profile/main               CompanyProfile
 *   organizations/{orgId}/pipelineItems/{itemId}     PipelineItem
 *     .../pipelineItems/{itemId}/stageEvents/{id}    StageEvent (append-only)
 *   organizations/{orgId}/documents/{docId}          DocumentRecord (phase 2)
 *
 * Timestamps are typed as `T` so the same shapes work with the client SDK,
 * the Admin SDK and plain Dates in tests.
 */

export type Lang = 'en' | 'ar';
/** [English, Arabic] pair, as used throughout the playbooks and profile schema. */
export type Bi = [en: string, ar: string];

export const STAGES = ['polling', 'recommended', 'writing', 'review', 'sent', 'outcomes'] as const;
export type Stage = (typeof STAGES)[number];

export const ROLES = ['admin', 'member', 'reviewer'] as const;
export type Role = (typeof ROLES)[number];

export const DECISIONS = ['go', 'go_with_conditions', 'no_go'] as const;
export type DecisionValue = (typeof DECISIONS)[number];

export const OPPORTUNITY_TYPES = ['tender', 'grant', 'competition', 'program', 'event'] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export interface UserDoc<T = unknown> {
  email: string;
  displayName: string;
  lang: Lang;
  defaultOrgId: string | null;
  createdAt: T;
}

export interface Organization<T = unknown> {
  name: string;
  createdBy: string;
  createdAt: T;
}

export interface Membership<T = unknown> {
  role: Role;
  email: string;
  displayName: string;
  joinedAt: T;
}

export interface Opportunity<T = unknown> {
  type: OpportunityType;
  title: string;
  description: string;
  organisation: string;
  organisationType: 'Government' | 'Private' | 'NGO' | 'Institutional Donor';
  link: string;
  applicationUrl: string | null;
  /** Exact deadline with time; timezone kept separately for display. */
  deadline: T | null;
  deadlineTimezone: string | null;
  region: string | null;
  country: string | null;
  sector: string | null;
  /** The official source this record came from. Always kept. */
  sourceUrl: string;
  /** Type-specific listing fields (bid bond, grant amount, prize...). */
  details: Record<string, unknown>;
  ingestedAt: T;
}

export interface Decision<T = unknown> {
  suggested: DecisionValue | null;
  value: DecisionValue;
  reason: string;
  conditions: string[];
  decidedBy: string;
  decidedAt: T;
}

export interface PipelineItem<T = unknown> {
  /** Null for opportunities the organisation added by hand. */
  opportunityId: string | null;
  title: string;
  stage: Stage;
  assigneeUid: string | null;
  deadline: T | null;
  decision: Decision<T> | null;
  createdBy: string;
  createdAt: T;
  updatedAt: T;
}

export interface StageEvent<T = unknown> {
  from: Stage | null;
  to: Stage;
  by: string;
  at: T;
}
