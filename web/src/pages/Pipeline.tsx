import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { STAGES, STAGE_COLORS, STAGE_LABELS, nextStage, previousStage, type Stage } from '@bdi/shared';
import { useI18n } from '../lib/i18n';
import { useReadySession } from '../lib/session';
import { addPipelineItem, moveItem, watchPipeline, type PipelineRow } from '../data/pipeline';
import { Button, ErrorNote, Field } from '../components/ui';

export default function Pipeline() {
  const { t, bi, formatDate, dir } = useI18n();
  const { orgId, user, membership } = useReadySession();
  const canEdit = membership.role !== 'reviewer';

  const [rows, setRows] = useState<PipelineRow[] | null>(null);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => watchPipeline(orgId, setRows, () => setError(true)), [orgId]);

  const byStage = useMemo(() => {
    const m = new Map<Stage, PipelineRow[]>(STAGES.map((s) => [s, []]));
    for (const r of rows ?? []) m.get(r.stage)?.push(r);
    return m;
  }, [rows]);

  async function move(item: PipelineRow, to: Stage) {
    setError(false);
    try {
      await moveItem(orgId, user.uid, item, to);
    } catch {
      setError(true);
    }
  }

  // Arrow glyphs follow reading direction.
  const fwd = dir === 'rtl' ? '←' : '→';
  const back = dir === 'rtl' ? '→' : '←';

  return (
    <main className="px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pipeline.title')}</h1>
          {rows && <p className="mt-1 text-sm text-muted">{t('pipeline.count', { n: rows.length })}</p>}
        </div>
        {canEdit && !adding && <Button onClick={() => setAdding(true)}>{t('pipeline.add')}</Button>}
      </header>

      {adding && <AddForm onDone={() => setAdding(false)} onSave={(title, deadline) => addPipelineItem(orgId, user.uid, title, deadline)} />}
      {error && (
        <div className="mb-4">
          <ErrorNote>{t('pipeline.err')}</ErrorNote>
        </div>
      )}

      {rows === null ? (
        <p className="text-muted" role="status">
          {t('pipeline.loading')}
        </p>
      ) : (
        <>
          {rows.length === 0 && !adding && <p className="mb-6 max-w-xl text-muted">{t('pipeline.emptyAll')}</p>}
          <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
            <ol className="grid min-w-[64rem] grid-cols-6 gap-3">
              {STAGES.map((stage) => {
                const items = byStage.get(stage) ?? [];
                return (
                  <li key={stage} className="flex min-h-48 flex-col rounded-xl bg-wash">
                    <div className="h-1 rounded-t-xl" style={{ background: STAGE_COLORS[stage] }} aria-hidden />
                    <h2 className="flex items-baseline justify-between gap-2 px-3 pt-3 pb-2 text-sm font-semibold">
                      <span>{bi(STAGE_LABELS[stage])}</span>
                      <span className="text-muted tabular-nums">{items.length}</span>
                    </h2>
                    <ul className="flex flex-1 flex-col gap-2 px-2 pb-2">
                      {items.length === 0 && <li className="px-1 py-2 text-sm text-subtle">{t('pipeline.empty')}</li>}
                      {items.map((item) => {
                        const due = item.deadline?.toDate();
                        const overdue = due ? due.getTime() < Date.now() : false;
                        const prev = previousStage(item.stage);
                        const next = nextStage(item.stage);
                        return (
                          <li key={item.id} className="rounded-lg border border-line bg-white p-3">
                            <p dir="auto" className="text-sm leading-snug font-medium break-words">{item.title}</p>
                            {due && (
                              <p className={`mt-2 text-xs ${overdue ? 'text-red' : 'text-amber'}`}>
                                {t(overdue ? 'pipeline.overdue' : 'pipeline.due', { date: formatDate(due) })}
                              </p>
                            )}
                            {canEdit && (
                              <div className="mt-3 flex items-center gap-1">
                                {prev && (
                                  <IconButton label={`${t('pipeline.back')}: ${bi(STAGE_LABELS[prev])}`} onClick={() => move(item, prev)}>
                                    {back}
                                  </IconButton>
                                )}
                                {next && (
                                  <button
                                    type="button"
                                    onClick={() => move(item, next)}
                                    className="ms-auto flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-teal-dd transition-colors hover:bg-teal-bg"
                                    title={`${t('pipeline.forward')}: ${bi(STAGE_LABELS[next])}`}
                                  >
                                    <span className="truncate">{bi(STAGE_LABELS[next])}</span>
                                    <span aria-hidden>{fwd}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      )}
    </main>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded-md text-teal-dd transition-colors hover:bg-teal-bg"
    >
      {children}
    </button>
  );
}

function AddForm({ onDone, onSave }: { onDone: () => void; onSave: (title: string, deadline: Date | null) => Promise<void> }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setFailed(false);
    try {
      await onSave(title, deadline ? new Date(deadline) : null);
      onDone();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 grid max-w-3xl gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-[minmax(0,1fr)_14rem]">
      <Field label={t('pipeline.addTitle')} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} required autoFocus />
      <Field label={t('pipeline.addDeadline')} type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      {failed && (
        <div className="md:col-span-2">
          <ErrorNote>{t('pipeline.err')}</ErrorNote>
        </div>
      )}
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={busy || !title.trim()}>
          {t('pipeline.save')}
        </Button>
        <Button type="button" variant="quiet" onClick={onDone}>
          {t('pipeline.cancel')}
        </Button>
      </div>
    </form>
  );
}
