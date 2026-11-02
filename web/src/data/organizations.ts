import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Lang } from '@bdi/shared';
import { db } from '../lib/firebase';

/**
 * Creates an organisation with the current user as its admin, and makes it
 * their default. One batch, so the security rules can check all three writes
 * together (see firestore.rules: organizations create / members bootstrap).
 */
export async function createOrganization(user: User, name: string, lang: Lang): Promise<string> {
  const orgRef = doc(collection(db, 'organizations'));
  const batch = writeBatch(db);
  batch.set(orgRef, { name: name.trim(), createdBy: user.uid, createdAt: serverTimestamp() });
  batch.set(doc(db, 'organizations', orgRef.id, 'members', user.uid), {
    role: 'admin',
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    joinedAt: serverTimestamp(),
  });
  batch.set(
    doc(db, 'users', user.uid),
    {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      lang,
      defaultOrgId: orgRef.id,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  await batch.commit();
  return orgRef.id;
}
