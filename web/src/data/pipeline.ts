import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import type { PipelineItem, Stage } from '@bdi/shared';
import { db } from '../lib/firebase';

export type PipelineRow = PipelineItem<Timestamp> & { id: string };

const itemsCol = (orgId: string) => collection(db, 'organizations', orgId, 'pipelineItems');

export function watchPipeline(
  orgId: string,
  onData: (rows: PipelineRow[]) => void,
  onError: (e: Error) => void,
): () => void {
  return onSnapshot(
    query(itemsCol(orgId), orderBy('createdAt', 'desc')),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as PipelineItem<Timestamp>) }))),
    onError,
  );
}

/** Adds an item in the first stage and records that as its first stage event. */
export async function addPipelineItem(orgId: string, uid: string, title: string, deadline: Date | null) {
  const ref = doc(itemsCol(orgId));
  const batch = writeBatch(db);
  batch.set(ref, {
    opportunityId: null,
    title: title.trim(),
    stage: 'polling',
    assigneeUid: null,
    deadline: deadline ? Timestamp.fromDate(deadline) : null,
    decision: null,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(ref, 'stageEvents')), { from: null, to: 'polling', by: uid, at: serverTimestamp() });
  await batch.commit();
}

/** Moves an item and appends the stage event in the same batch. */
export async function moveItem(orgId: string, uid: string, item: PipelineRow, to: Stage) {
  if (item.stage === to) return;
  const ref = doc(itemsCol(orgId), item.id);
  const batch = writeBatch(db);
  batch.update(ref, { stage: to, updatedAt: serverTimestamp() });
  batch.set(doc(collection(ref, 'stageEvents')), { from: item.stage, to, by: uid, at: serverTimestamp() });
  await batch.commit();
}
