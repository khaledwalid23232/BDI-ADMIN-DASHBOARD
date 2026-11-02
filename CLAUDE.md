# Business Daily Insights: project guide for Claude

Read `docs/PRODUCT_PLAN.md` first. It has the current state, the gaps to a live product, the architecture, the roadmap and the open decisions.

## Where things are
- `web/`: the live app (React, TypeScript, Vite, Tailwind 4). UI strings in `web/src/lib/dictionary.ts`, both languages.
- `shared/`: types and Firestore layout (`src/types.ts`), stages, funnel maths, and the playbooks and profile schema as JSON (`src/content/`).
- `firestore.rules`, `storage.rules`: tenant isolation. Every change needs a matching test in `tests/rules/`.
- `index.html`: the original single-file demo, kept as the reference for screens still to port. It is not the BDI admin console.
- `docs/PRODUCT_PLAN.md`: the plan. `docs/FIREBASE_SETUP.md`: one-time console steps.

## Stack (decided)
Firebase project `bdi-admin-dashboard`: Auth, Firestore and Hosting now; Storage and Cloud Functions from phase 2 (Blaze plan). Region `europe-west2` for everything. Commands: `npm run dev`, `npm test`, `npm run test:rules`, `npm run deploy`.

## Rules that always apply
1. The AI never invents experience, numbers, results, CVs, referees or partners. Anything without a source in the company profile, uploaded old proposals or the user's answers is shown as a gap.
2. The writer has two phases. Phase 1 reads the tender (after the NDA/AI yes-no gate) and screens it; the user chooses GO, GO WITH CONDITIONS or NO-GO. Phase 2, the proposal, stays locked until GO or GO WITH CONDITIONS. The agent suggests, the user decides.
3. Arabic (RTL) and English everywhere, including generated proposals.
4. Tender documents and old proposals are trusted references. The AI uses them as sources for the screening and the writing.
5. "Estimated" amounts on opportunities are for display, never a budget ceiling.
6. Keep one SOP page per opportunity family up to date when behaviour changes.

## Working style
- The owner writes in Egyptian Arabic mixed with English. Explanations in Egyptian dialect are welcome; code, comments and docs in English.
- Ask before choosing an AI provider or a data source, or anything that publishes content or costs money (including the Blaze plan and deploying).
- The BDI-branded admin console is a separate demo outside this repo. Whether it becomes this product's admin is an open decision (plan, section 10).
