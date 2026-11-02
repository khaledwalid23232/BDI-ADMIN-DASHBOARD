import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Membership, Organization, UserDoc } from '@bdi/shared';
import { auth, db } from './firebase';

/**
 * Who is signed in and which organisation they are working in.
 * status:
 *   loading   – waiting for Firebase
 *   signedOut – show the sign-in screen
 *   noOrg     – signed in but not in an organisation yet: show setup
 *   ready     – user, org and membership are all loaded
 */
export type Session =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'noOrg'; user: User }
  | {
      status: 'ready';
      user: User;
      orgId: string;
      org: Organization;
      membership: Membership;
    };

const SessionContext = createContext<Session>({ status: 'loading' });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [userDoc, setUserDoc] = useState<UserDoc | null | undefined>(undefined);
  const [org, setOrg] = useState<Organization | null | undefined>(undefined);
  const [membership, setMembership] = useState<Membership | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    setUserDoc(undefined);
    if (!user) return;
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => setUserDoc(snap.exists() ? (snap.data() as UserDoc) : null),
      () => setUserDoc(null),
    );
  }, [user]);

  const orgId = userDoc?.defaultOrgId ?? null;

  useEffect(() => {
    setOrg(undefined);
    setMembership(undefined);
    if (!user || !orgId) return;
    const unsubOrg = onSnapshot(
      doc(db, 'organizations', orgId),
      (snap) => setOrg(snap.exists() ? (snap.data() as Organization) : null),
      () => setOrg(null),
    );
    const unsubMember = onSnapshot(
      doc(db, 'organizations', orgId, 'members', user.uid),
      (snap) => setMembership(snap.exists() ? (snap.data() as Membership) : null),
      () => setMembership(null),
    );
    return () => {
      unsubOrg();
      unsubMember();
    };
  }, [user, orgId]);

  let session: Session;
  if (user === undefined) session = { status: 'loading' };
  else if (user === null) session = { status: 'signedOut' };
  else if (userDoc === undefined) session = { status: 'loading' };
  else if (!orgId) session = { status: 'noOrg', user };
  else if (org === undefined || membership === undefined) session = { status: 'loading' };
  else if (!org || !membership) session = { status: 'noOrg', user };
  else session = { status: 'ready', user, orgId, org, membership };

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  return useContext(SessionContext);
}

export function useReadySession() {
  const s = useSession();
  if (s.status !== 'ready') throw new Error('useReadySession used before the session was ready');
  return s;
}
