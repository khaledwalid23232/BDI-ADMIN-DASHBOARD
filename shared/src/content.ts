import type { Bi } from './types';
import playbooksJson from './content/playbooks.json';
import profileSchemaJson from './content/profile-schema.json';

/**
 * Playbooks and the profile schema, exported from the original dashboard
 * (which was generated from sop_data.py / sop_profile.py). Treat these JSON
 * files as the source of truth until the SOP Python sources join the repo.
 */

export type BiList = Bi[];

export interface PlaybookVariant {
  from: BiList;
  old: BiList;
  ask: BiList;
  attach: BiList;
}

export interface PlaybookType {
  id: string;
  name: Bi;
  proposal: Bi;
  price: boolean;
  win: Bi;
  effort: Bi;
  note: Bi;
  /** Sections to write: [title, what goes in it]. */
  write: [Bi, Bi][];
  from: BiList;
  old: BiList;
  ask: BiList;
  attach: BiList;
  scope: 'nat' | 'intl' | 'both';
}

export interface PlaybookFamily {
  id: 'tenders' | 'grants' | 'competitions' | 'programs' | 'events';
  nav: Bi;
  variants: { nat: PlaybookVariant; intl: PlaybookVariant };
  types: PlaybookType[];
}

export type ProfileFieldType = 'text' | 'textarea' | 'number' | 'select' | 'multi' | 'yesno' | 'file' | 'projref';

export interface ProfileField {
  id: string;
  label: Bi;
  type: ProfileFieldType;
  opts: Bi[] | null;
  req: boolean;
}

export interface ProfileSection {
  id: string;
  title: Bi;
  why: Bi;
  fields?: ProfileField[];
  record?: { id: string; min: number; label: Bi; title: string; fields: ProfileField[] };
}

export interface ProfileSchema {
  sections: ProfileSection[];
}

export const PLAYBOOKS = playbooksJson as PlaybookFamily[];
export const PROFILE_SCHEMA = profileSchemaJson as ProfileSchema;
