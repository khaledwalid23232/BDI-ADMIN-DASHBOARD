# Business Daily Insights

Find tenders and grants, decide GO or NO-GO, and write proposals from what the company already knows. Arabic and English.

This repo holds two things:

| Path | What it is |
|---|---|
| `index.html` | The original single-file demo (demo data, `localStorage`, no backend). Kept as the reference for screens still to port. Open it in a browser or serve it with GitHub Pages. |
| everything else | The live product, being built on Firebase. See below. |

Plan: [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md). Rules for working on it: [`CLAUDE.md`](CLAUDE.md). One-time Firebase console steps: [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).

## The live product

- **Front end:** React 18, TypeScript, Vite, Tailwind 4, in `web/`. Arabic (RTL) and English from the start.
- **Back end:** Firebase project `eagle-eyes-6294d`. Auth (email and password), Firestore in `europe-west1`, Hosting. Storage and Cloud Functions come in phase 2.
- **Shared:** types, stages, funnel maths, playbooks and the company-profile schema, in `shared/`.
- **Security:** `firestore.rules` and `storage.rules` keep every organisation's data private to its members. Tested in `tests/rules/`.

### Run it

```bash
npm install
npm run dev               # web app at http://localhost:5173, against the real Firebase project
```

To work fully offline against local emulators (needs Java 21):

```bash
echo "VITE_USE_EMULATORS=true" > web/.env.local
npm run dev:emulators     # in one terminal (UI at http://localhost:4000)
npm run dev               # in another
```

### Check it

```bash
npm run typecheck
npm test                  # unit tests (shared, web)
npm run test:rules        # security-rules tests, starts the emulator itself (needs Java 21)
npm run build
```

CI runs all four on every push and pull request (`.github/workflows/ci.yml`).

### Deploy

```bash
npx firebase login
npm run deploy            # hosting + Firestore rules and indexes
```
