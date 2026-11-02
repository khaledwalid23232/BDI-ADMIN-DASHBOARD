/**
 * Firestore rules tests. Run from the repo root with `npm run test:rules`,
 * which starts the emulator, runs these, and stops it.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bdi',
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  });
});
afterAll(async () => env?.cleanup());
beforeEach(async () => env.clearFirestore());

const db = (uid: string | null): Firestore =>
  (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore() as unknown as Firestore;

/** Creates an org the way the app does: org + admin membership in one batch. */
function createOrgBatch(f: Firestore, orgId: string, uid: string) {
  const b = writeBatch(f);
  b.set(doc(f, 'organizations', orgId), { name: 'Acme', createdBy: uid, createdAt: serverTimestamp() });
  b.set(doc(f, 'organizations', orgId, 'members', uid), {
    role: 'admin',
    email: `${uid}@example.com`,
    displayName: uid,
    joinedAt: serverTimestamp(),
  });
  return b;
}

/** Seeds data bypassing rules. */
async function seed(orgId: string, members: Record<string, string>) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, 'organizations', orgId), { name: orgId, createdBy: Object.keys(members)[0] });
    for (const [uid, role] of Object.entries(members)) {
      await setDoc(doc(f, 'organizations', orgId, 'members', uid), { role, email: '', displayName: uid });
    }
    await setDoc(doc(f, 'organizations', orgId, 'pipelineItems', 'item1'), {
      title: 'Seed item',
      stage: 'polling',
      createdBy: Object.keys(members)[0],
    });
  });
}

describe('organisations', () => {
  it('a signed-in user can create an org with themselves as admin', async () => {
    await assertSucceeds(createOrgBatch(db('alice'), 'org1', 'alice').commit());
  });

  it('cannot create an org without the admin membership in the same batch', async () => {
    await assertFails(setDoc(doc(db('alice'), 'organizations', 'org1'), { name: 'Acme', createdBy: 'alice' }));
  });

  it('cannot create an org on behalf of someone else', async () => {
    const f = db('alice');
    const b = writeBatch(f);
    b.set(doc(f, 'organizations', 'org1'), { name: 'Acme', createdBy: 'bob' });
    b.set(doc(f, 'organizations', 'org1', 'members', 'alice'), { role: 'admin' });
    await assertFails(b.commit());
  });

  it('cannot make themselves admin of an existing org', async () => {
    await seed('org1', { alice: 'admin' });
    await assertFails(setDoc(doc(db('mallory'), 'organizations', 'org1', 'members', 'mallory'), { role: 'admin' }));
  });

  it('signed-out visitors can do nothing', async () => {
    await seed('org1', { alice: 'admin' });
    await assertFails(getDoc(doc(db(null), 'organizations', 'org1')));
    await assertFails(createOrgBatch(db(null), 'org2', 'x').commit());
  });
});

describe('tenant isolation', () => {
  beforeEach(async () => {
    await seed('org1', { alice: 'admin' });
    await seed('org2', { bob: 'admin' });
  });

  it('members read their own org', async () => {
    await assertSucceeds(getDoc(doc(db('alice'), 'organizations', 'org1')));
    await assertSucceeds(getDoc(doc(db('alice'), 'organizations', 'org1', 'pipelineItems', 'item1')));
  });

  it("nobody reads or writes another org's data", async () => {
    const f = db('alice');
    await assertFails(getDoc(doc(f, 'organizations', 'org2')));
    await assertFails(getDoc(doc(f, 'organizations', 'org2', 'pipelineItems', 'item1')));
    await assertFails(getDoc(doc(f, 'organizations', 'org2', 'profile', 'main')));
    await assertFails(setDoc(doc(f, 'organizations', 'org2', 'profile', 'main'), { x: 1 }));
    await assertFails(
      addDoc(collection(f, 'organizations', 'org2', 'pipelineItems'), {
        title: 'x',
        stage: 'polling',
        createdBy: 'alice',
      }),
    );
  });
});

describe('roles', () => {
  beforeEach(async () => seed('org1', { alice: 'admin', mo: 'member', rita: 'reviewer' }));

  it('members edit the profile; reviewers only read it', async () => {
    await assertSucceeds(setDoc(doc(db('mo'), 'organizations', 'org1', 'profile', 'main'), { a: 1 }));
    await assertSucceeds(getDoc(doc(db('rita'), 'organizations', 'org1', 'profile', 'main')));
    await assertFails(setDoc(doc(db('rita'), 'organizations', 'org1', 'profile', 'main'), { a: 2 }));
  });

  it('only admins manage members, and never their own role', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'organizations', 'org1', 'members', 'new'), { role: 'member' }));
    await assertFails(setDoc(doc(db('mo'), 'organizations', 'org1', 'members', 'new2'), { role: 'member' }));
    await assertFails(updateDoc(doc(db('mo'), 'organizations', 'org1', 'members', 'mo'), { role: 'admin' }));
    await assertFails(deleteDoc(doc(db('alice'), 'organizations', 'org1', 'members', 'alice')));
  });

  it('only admins delete pipeline items', async () => {
    await assertFails(deleteDoc(doc(db('mo'), 'organizations', 'org1', 'pipelineItems', 'item1')));
    await assertSucceeds(deleteDoc(doc(db('alice'), 'organizations', 'org1', 'pipelineItems', 'item1')));
  });
});

describe('pipeline and stage events', () => {
  beforeEach(async () => seed('org1', { alice: 'admin', rita: 'reviewer' }));
  const events = (f: Firestore) => collection(f, 'organizations', 'org1', 'pipelineItems', 'item1', 'stageEvents');

  it('rejects unknown stages', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'organizations', 'org1', 'pipelineItems', 'item1'), { stage: 'won' }));
  });

  it('records a stage change signed by the mover at server time', async () => {
    await assertSucceeds(addDoc(events(db('alice')), { from: 'polling', to: 'recommended', by: 'alice', at: serverTimestamp() }));
  });

  it('rejects events signed by someone else, backdated, or from reviewers', async () => {
    await assertFails(addDoc(events(db('alice')), { from: 'polling', to: 'recommended', by: 'bob', at: serverTimestamp() }));
    await assertFails(addDoc(events(db('alice')), { from: 'polling', to: 'recommended', by: 'alice', at: new Date(2020, 0, 1) }));
    await assertFails(addDoc(events(db('rita')), { from: 'polling', to: 'recommended', by: 'rita', at: serverTimestamp() }));
  });

  it('keeps the history append-only', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'organizations/org1/pipelineItems/item1/stageEvents/e1'), { to: 'polling' });
    });
    const e = doc(db('alice'), 'organizations/org1/pipelineItems/item1/stageEvents/e1');
    await assertFails(updateDoc(e, { to: 'sent' }));
    await assertFails(deleteDoc(e));
  });
});

describe('catalogue and users', () => {
  it('signed-in users read opportunities but cannot write them', async () => {
    await assertSucceeds(getDoc(doc(db('alice'), 'opportunities', 'x')));
    await assertFails(setDoc(doc(db('alice'), 'opportunities', 'x'), { title: 'fake' }));
  });

  it('users only touch their own user document', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'users', 'alice'), { lang: 'ar' }));
    await assertFails(getDoc(doc(db('alice'), 'users', 'bob')));
  });
});
