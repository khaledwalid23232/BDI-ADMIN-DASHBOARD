# Business Daily Insights: from demo to live product

Plan to turn the single-file dashboard in this repo (`index.html`) into a real, hosted product. Written on 2 Nov 2026 as a hand-off, so a new Claude chat (or a developer) can continue without the earlier conversation.

**ملخص بالعربي:** اللوحة الحالية ملف HTML واحد، كل بياناتها تجريبية وبتتحفظ في متصفح كل مستخدم. عشان تبقى منتج حي محتاجين: (1) حسابات وسيرفر وقاعدة بيانات، (2) فرص حقيقية من مصادر موثوقة، (3) ذكاء اصطناعي حقيقي بيقرا الـ ToR ويكتب العرض من ملف الشركة بدون تأليف، (4) محرر وتصدير للعروض، (5) أمان وخصوصية. الخطة تحت مقسمة لمراحل، وأهم قاعدة: **ممنوع الذكاء الاصطناعي يألّف أي خبرة أو رقم.**

---

## 1. What exists today

`index.html` is one 2,600-line file (about 346 KB): vanilla JavaScript, no build step, no backend, no login. Everything is saved in the visitor's browser (`localStorage`). All opportunities are **illustrative demo data** (94 seeded records, 10 demo donors, a fixed reference date of 21 Oct 2026).

| Area | What it does now | Real or demo |
|---|---|---|
| Pipeline | 6-stage funnel (polling, recommended, writing, review, sent, outcomes), kanban with drag and drop, calendar, `.ics` export, period selector, search, notifications | UI real; data demo; funnel Q4 2026 is a frozen snapshot |
| Language | English and Arabic with full RTL | Real |
| Company profile (top right) | 9 sections filled once: identity, products and services, sectors and geography, past projects, team, partners, proof, readiness, pricing and preferences. Saved locally | UI real; storage local |
| AI proposal writer, phase 1 (screening) | Upload ToR (PDF read in the browser with pdf.js, behind an NDA yes/no gate), pick type and national/international, screening memo, requirement check, partner suggestions, 8-criteria scorecard, decision GO / GO WITH CONDITIONS / NO-GO | **Demo logic**: regex extraction, heuristic scores |
| AI proposal writer, phase 2 (proposal) | Locked until GO or conditional GO. Shows the playbook sections, document list, questions, attachment checklist, draft box, saved attempts | **Demo**: draft comes from a fixed template; no AI is called; old proposals are file names only |
| Playbooks | 18 proposal types across tenders (7), grants (4), competitions (2), programs (3), events (2), each with what to write and what data it needs, split national/international | Content real; tenders follow the BDI course, others follow common practice |
| Expert review | "$199" request button | Demo: no payment, no reviewer |

Related material (not in this repo yet):
- **SOP pages** (bilingual, one per opportunity family): https://claude.ai/artifact/A1XDtrNmaRZy5so71BLBDc . Generated from `sop_data.py` (playbooks) and `sop_profile.py` (profile schema) by `build.py`. These Python files are the source of truth for playbook and profile content.
- **BDI Admin** (separate, BDI-branded copy with an admin console for stages, metrics, opportunity types, CSV import, branding): a different artifact. It is a demo for white-labelling, not the product.
- **Opportunity schemas**: a spreadsheet with one tab each for Tenders, Grants, Competitions, Programs and Events, plus filters and the prompts used to collect data. See section 4.

A TypeScript skeleton also existed locally in `bdi-dashboard/` (React 18, Vite, Express, zustand, Tailwind 4, Radix, vitest). It is superseded by the Firebase app in this repo (`web/`, `shared/`); nothing from its `server/` is needed.

## 2. Product rules that must not change

These came from the owner and apply to every part of the product.

1. **The AI never invents.** No experience, numbers, results, CVs, referees or partners that are not in the company profile, the uploaded old proposals or the user's answers. Missing data appears as a visible gap with what is needed.
2. **Learn the company from what it already wrote**: the profile and its old proposals. Ask the user only what is specific to the opportunity, mostly choices and Yes/No.
3. **Read before writing.** Phase 1 (screening and decision) must finish before phase 2 (the proposal) opens. NO-GO keeps the proposal locked.
4. **The agent suggests, the user decides** (GO, GO WITH CONDITIONS, NO-GO).
5. **NDA gate.** The agent reads a tender document only after the user confirms the NDA allows AI tools to read it.
6. **Bilingual from the start**, Arabic (RTL) and English, in the UI and in generated proposals.
7. **One SOP page per opportunity family** documents every playbook; any change to behaviour is logged there.
8. Estimated amounts in the opportunity data (for example "Estimated" grant amount) are for display only and are never used as a budget ceiling.

## 3. What "real product" means: gaps to close

| # | Gap | Today | Needed |
|---|---|---|---|
| G1 | Accounts and tenancy | None; one browser = one user | Sign-up and login, organisations (tenants), roles (admin, member, reviewer), invitations |
| G2 | Server and database | `localStorage` | Hosted API and database; every record tied to an organisation |
| G3 | Real opportunities | 94 demo records | Ingestion from official sources into the schemas in section 4; de-duplication; expiry; per-organisation matching |
| G4 | Real AI | Fixed template and regex | Server-side ToR reading with citations, screening memo, section-by-section drafting grounded in the profile (section 6) |
| G5 | Documents | File names only | Upload to private storage, text extraction (including Arabic and scanned PDFs), per-document "AI allowed" flag, retention rules |
| G6 | Proposal workspace | One text box | Section editor, versions, comments, compliance matrix, pricing build-up, export to DOCX and PDF, separate technical and financial files |
| G7 | Pipeline truth | Seeded stage history, frozen reference cohort | Real stage-change events, assignees, deadlines, notifications, metrics computed from events |
| G8 | Payments | Fake "$199" button | Real payments and a reviewer workflow, or remove it from the first release |
| G9 | Security and privacy | None needed for a demo | Tenant isolation, encryption, audit log, backups, data-protection compliance (section 7) |
| G10 | Quality | Manual checks | Automated tests, evaluation set for the AI, error monitoring, CI |

## 4. Data: opportunities

The schemas are already designed. Each opportunity type has a listing schema (what the user sees and filters on) and, for writing, a proposal brief that is **extracted from the official documents when the user opens the writer**.

Shared listing fields: title, description, link, organisation, organisation link, organisation type (Government, Private, NGO, Institutional Donor), official contacts, application URL, deadline (and derived deadline status: Open, Closing Soon, Expired), region, country, sector, aggregator link, source file.

Per type:

| Type | Extra listing fields |
|---|---|
| Tenders | Bid bond, currency, eligible applicant category (Company, Individual, NGO), application method (Online, Offline, Hybrid), language, tender documents, address |
| Grants | Grant amount, amount per beneficiary, known or estimated, currency, amount details, eligible countries and applicants, application method, official documents |
| Competitions | Start and end date, prize amount and details, number of winners, judging criteria, city |
| Programs | Program type (Accelerator, Incubator, Venture Capital, Angel Investors; equity or non-equity), duration, cost to participant, cohort size, eligible stage |
| Events | Event type (Conference, Exhibition, Trade Show, Workshop), ticket type and price, start and end date, registration deadline, target audience, attendance mode, venue, city |

Normalised lists to keep as reference tables: 16 sectors, 15 regions, countries, 14 target audiences, organisation types, deadline statuses.

Known inconsistencies in the source spreadsheet to fix when building the database: Program Type has four different value lists across tabs; some tabs list 23 sectors and others 16; the Tenders example row has a banner image where the tender documents link should be; "Bid Bond" and "Bid Bond Amount" are used for the same field; deadlines have no time or time zone (proposals need the exact hour).

Two data points the writer needs that the listing schemas do not have, and which should be added to the **tender** record: tender type (RFP, RFQ, ITB, EOI, prequalification, framework, donor-funded) and a link to the tender documents (the actual pack, not a banner).

**Risk, decide before building ingestion:** collecting opportunities from aggregator websites may breach their terms or copyright. Prefer official sources, feeds and APIs, keep the original official link on every record, and get permission or a licence where needed.

## 5. Target architecture

**Decided (2 Nov 2026): Firebase**, project `bdi-admin-dashboard`, region `europe-west2`. The shape of the plan stays; the pieces map like this:

- **Front end:** React 18 and TypeScript with Vite and Tailwind 4 (`web/`), i18n and RTL built in. Port the single file's screens one by one. Served by **Firebase Hosting**.
- **Auth:** **Firebase Authentication**, email and password first; organisation invites; optional Google sign-in later.
- **Database:** **Cloud Firestore** (`europe-west2`). Tenant isolation is enforced by **Security Rules** (`firestore.rules`) instead of PostgreSQL row-level security, and tested in `tests/rules/` against the emulator. All organisation data sits under `organizations/{orgId}/...`. Playbooks and the profile schema are versioned JSON in `shared/src/content/`.
- **Storage:** **Cloud Storage for Firebase** under `orgs/{orgId}/...`, same membership check (`storage.rules`). Needs the Blaze plan on new projects; arrives in phase 2.
- **Jobs and AI:** **Cloud Functions (2nd gen)** in `europe-west2`, with Cloud Tasks or Pub/Sub as the queue, for ingestion, document processing and AI calls (section 6). Needs Blaze; arrives in phase 2.
- **Environments:** Hosting preview channels for staging at first; a separate staging project before launch.

Firestore has no joins or ad-hoc SQL, so collections are shaped around how screens read them, and funnel metrics are computed from `stageEvents` in code (`shared/src/funnel.ts`), or later as rollups written by a function.

Main collections (the "tables" below map to these Firestore paths; see `shared/src/types.ts` for the live shapes):

- `users/{uid}`, `opportunities/{id}` (server-written catalogue)
- `organizations/{orgId}` with subcollections `members`, `profile`, `pipelineItems` (each with an append-only `stageEvents` subcollection) and `documents`

Original table sketch:

| Table | Holds |
|---|---|
| organizations, users, memberships | tenants, people, roles |
| company_profiles | the 9 profile sections; records for products, projects, team, partners |
| opportunities | the shared catalogue: type, listing fields, type-specific fields (JSONB), source, official links |
| pipeline_items | one organisation's tracking of an opportunity: stage, assignee, writer state, decision |
| stage_events | every stage change with who and when (all funnel metrics derive from this) |
| documents | uploaded files, storage reference, extracted text, hash, "AI allowed" flag |
| extractions | structured fields read from a document, each with page number and quote |
| screening_memos | memo output, the inputs it used, version |
| decisions | GO / GO WITH CONDITIONS / NO-GO, suggested value, reason, note, conditions ticked |
| proposals, proposal_sections | section text, sources used, gaps flagged, versions |
| comments, notifications, audit_log | collaboration and traceability |
| plans, expert_reviews | billing and reviews (later phase) |

Mapping from the current single file:

| Today (in `index.html`) | Becomes |
|---|---|
| `generateSeed`, demo funders and sectors | opportunity ingestion and reference tables |
| `data.opps[].stageHistory` | `stage_events` |
| `computeFunnel`, `REFERENCE_FUNNEL` | SQL or service computing metrics from `stage_events`; drop the frozen snapshot |
| `companyOf`, `recs`, profile modal | `company_profiles` API and the same forms |
| `PLAYBOOKS` (generated block) | playbook JSON served by the API |
| `torFind`, `torPages` | server-side extraction with the AI service (browser reading removed) |
| `bidAnalysis`, `screenOf` | memo service (rules for scoring plus AI for reading), same output shape |
| `DemoProposalAssistant`, draft box | section writer service and editor |
| `DemoPaymentProvider` | real payment provider, or removed in v1 |
| `localStorage` keys `bdi-awards-pipeline:*` | one-time import for existing demo users, then removed |

## 6. The AI service

Goal: reproduce the two phases for real, with every output traceable to a source.

**Phase 1: read and screen**
1. Extract text per page (text PDFs first; OCR for scans; Arabic and English). Keep page numbers.
2. Extract the tender facts with structured output, each with `page` and `quote`: document type, procurement method, submission format, selection method and weights, technical threshold, budget, key dates (exact hour and time zone), mandatory requirements with clause, evaluation criteria with points, ToR tasks, key experts, financial forms, contract terms, guarantees, required forms.
3. Compare with the company profile to get each requirement's status: met, gap, covered by partner, not in profile. Keep this comparison as deterministic code where possible; use the model only to read and to match meaning.
4. Produce the screening memo: how well it fits, chance of winning, time needed against days left, effort by area, what works, what is missing, top 2 recommendations ranked by effect (for example "team up with partner X: score 57 to 72"). Today's numbers are heuristics; replace them with calibrated ones (section 8).
5. Suggest GO / GO WITH CONDITIONS / NO-GO and a conditions list. The user decides.

**Phase 2: write**
- Generate one section at a time, using the playbook's section list and writing rules, the evaluation criteria as headings, and only retrieved facts: profile records, past projects, team, partners, uploaded old proposals, user answers.
- Every sentence that states a fact must carry a source id. Facts without a source are not written; they become a gap marker and a question to the user.
- Automatic checks before the proposal can move to Review, for example: no price in the technical file, person-days match between technical and financial files, every ToR task covered, nothing invented, page limits respected, price under any published ceiling, every named expert has a signed CV and availability letter. A list of 17 such checks was drafted early on in an RFP-only page that was later withdrawn; it is not in the current SOP, so re-create and document it there first.
- Pricing is built from person-days and rates the user confirmed; the model never chooses a rate.

**Safety**
- Tender documents and old proposals are trusted reference sources: the AI reads them and uses them as the basis for screening and writing.
- Respect the NDA gate and the per-document AI flag. No tender text goes to a provider the organisation did not accept.
- Log prompts and outputs per proposal for audit, with retention limits.
- Keep the model configurable (use a current, capable model) and keep cost under control: read only the relevant pages, cache extractions, stream long drafts.

## 7. Security, privacy and compliance

- Tenant isolation enforced in the database, not only in code. Test it.
- Encrypt in transit and at rest; private storage; signed, short-lived URLs.
- Roles and an audit log for sensitive actions (view, export, delete, decision changes).
- Personal data (CVs, names, contacts) is in scope of data-protection law. Confirm obligations with legal counsel (Egypt's data-protection law and any client-country rules), then set retention and deletion tools.
- Provider terms: confirm the AI provider does not train on submitted data and meets confidentiality needs; document it for customers.
- The admin console must not ship without authentication (the demo admin has none).
- Backups and a restore test before launch.

## 8. Quality: tests and evaluation

- **Unit and integration tests** (vitest in the skeleton) for scoring, funnel metrics from events, tender extraction, CSV import.
- **End-to-end tests** for the main flows: sign up, fill profile, open a tender, upload ToR, read memo, decide, write, export.
- **AI evaluation set:** collect 20 to 30 real tender documents (anonymised, Arabic and English, text and scanned). Hand-label the facts above. Track per-field precision and recall, and fail a release that drops below the agreed bar.
- **Memo calibration:** compare the memo's suggested decision and win estimate against what experienced bid managers would decide and what actually happened (use the outcomes the product records). Replace heuristics with calibrated rules once there is data.
- **Hallucination rate:** sample drafts and count sentences without a valid source. The target is zero for facts about the company.
- Accessibility and RTL checks on every screen; performance budget on the pipeline view.

## 9. Roadmap

Sizes are rough (S about a week, M two to three weeks, L a month or more) for one small team. Phases can overlap after phase 0.

| Phase | Goal | Contents | Size |
|---|---|---|---|
| 0. Foundations | Decide and set up | Owner decisions (section 10), repo layout, TypeScript app from the skeleton, CI, staging environment, move playbook and profile schema to JSON | S |
| 1. Accounts and real pipeline | A user can log in and track real opportunities | Auth and organisations, database, company profile saved server-side, pipeline and stage events, ingestion of tenders from agreed sources, import of existing browser data | L |
| 2. Real ToR reading and screening | Phase 1 of the writer for real | Document upload and storage, extraction with citations, screening memo, decision, evaluation set v1 | L |
| 3. Real proposal writing | Phase 2 of the writer for real | Section writer grounded in profile, section editor, versions, checks, compliance matrix, pricing build-up, export to DOCX and PDF | L |
| 4. Team and operations | Use it as a team | Comments, assignees, deadline notifications (email first), calendar sync, bid library of past proposals, lessons-learned log | M |
| 5. Other opportunity types | Beyond tenders | Grants, competitions, programs, events: listing ingestion, playbook checks, writer. Review the non-tender playbooks against the BDI Part Two material (donors and investors) when it is available | L |
| 6. Business | Charge for it | Plans, payments, reviewer workflow for expert review, admin console (stages, types, branding) with authentication, usage limits | M to L |
| 7. Launch | Go live | Security review, load and restore tests, legal text, onboarding, support process, monitoring | M |

**Phase 0 status (2 Nov 2026): done in code**, waiting on the console steps in `docs/FIREBASE_SETUP.md`.
- npm workspaces: `web/` (React app), `shared/` (types, stages, funnel, playbooks and profile JSON), `tests/rules/`.
- Sign-in, sign-up, password reset; create an organisation (creator becomes admin); app shell in Arabic and English.
- Pipeline board on Firestore: add an opportunity by hand, move it between the 6 stages; every move writes a `stageEvents` record.
- Firestore and Storage rules with tenant isolation and roles (admin, member, reviewer), plus a rules test suite.
- CI on GitHub Actions: typecheck, unit tests, build, rules tests on the emulator.
- Not yet: Cloud Functions and Storage (need Blaze), invites, company profile screen, real opportunities (phase 1).

**First live release (MVP) = phases 0 to 3 for tenders only.** Acceptance: a new organisation can sign up, fill the profile, see real tenders, open one, upload its ToR, read a cited screening memo, decide, and export a proposal draft in which every company fact has a source and every gap is flagged, in Arabic or English.

Out of scope for the MVP: payments, expert-review marketplace, grants and other types, mobile app, WhatsApp integration.

## 10. Decisions needed from the owner

1. ~~Stack and hosting, region for data storage.~~ **Decided:** Firebase (`bdi-admin-dashboard`), `europe-west2`. See section 5.
2. Which opportunity sources are allowed, and who clears their terms of use.
3. Which AI provider and model, and the data-processing terms to accept for confidential tenders.
4. Pricing model and whether the first release is free, invite-only or paid.
5. Who reviews AI proposals before customers rely on them (internal experts?).
6. Whether the repository stays public. The dashboard code and this plan are public today. Consider keeping the SOP source (the BDI-derived playbooks) and any real tender documents in a private place.
7. Brand and domain for the product, and whether the BDI-branded admin becomes the admin of this product or stays a separate white-label demo.
8. Whether to keep Arabic and English as the only languages (French appears in the profile's language list).

## 11. Known demo shortcuts to remove

- Seeded data, fixed reference date, frozen Q4 cohort, seeded notifications.
- `DemoProposalAssistant` (fixed template) and `DemoPaymentProvider`.
- Regex-based ToR extraction and heuristic memo numbers (time, chance of winning, effort split are all estimates).
- Old proposals are stored as file names only; nothing is read from them.
- Everything lives in `localStorage`; clearing site data deletes it.
- Single-file app with inline CSS and JavaScript; fonts and pdf.js are loaded from public CDNs.

## 12. Starter prompt for the next chat

> I am continuing the Business Daily Insights product. Read `CLAUDE.md` and `docs/PRODUCT_PLAN.md` in this repo first. Phase 0 is done: the app runs on Firebase (`bdi-admin-dashboard`, `europe-west2`) with sign-in, organisations, the pipeline on Firestore, security rules with tests, and CI. We are starting **phase 1**: the company profile screen saved to Firestore, team invites, and real opportunities. Follow the product rules in section 2 exactly. Ask me before choosing an AI provider or a data source, or anything that costs money.
