# Firebase setup: one-time steps in the console

Project: `eagle-eyes-6294d`. These are clicks in https://console.firebase.google.com that code cannot do. Do them once, in this order.

**بالعربي:** دي خطوات بتتعمل مرة واحدة بس من لوحة Firebase. أهم حاجة: اختار المنطقة `europe-west1` لما تعمل قاعدة البيانات، لأنها مش بتتغير بعد كده.

## Needed now (free Spark plan is enough)

1. **Firestore database.** Build > Firestore Database > Create database.
   - Location: **`europe-west1` (Belgium)**. This cannot be changed later. It is the closest region to Egypt where every Firebase product we need is available.
   - Start in **production mode** (everything locked). Our rules in `firestore.rules` open exactly what the app needs.
2. **Sign-in.** Build > Authentication > Get started > Sign-in method > **Email/Password** > Enable. (Leave "Email link" off.)
3. **Authorized domains.** Authentication > Settings > Authorized domains. `localhost` and `eagle-eyes-6294d.web.app` are there by default. Add the custom domain here later.
4. **Restrict the API key.** Google Cloud Console > APIs & Services > Credentials > the "Browser key" > Application restrictions: Websites. Add `eagle-eyes-6294d.web.app/*`, `eagle-eyes-6294d.firebaseapp.com/*` and `localhost:5173/*`.

## First deploy (from your computer)

```bash
npm install
npx firebase login
npm run deploy        # builds the web app, deploys hosting + Firestore rules and indexes
```

The app is then live at https://eagle-eyes-6294d.web.app.

## Later (phase 2, needs the Blaze pay-as-you-go plan)

- **Cloud Storage** for uploaded ToRs and old proposals. New projects need Blaze for Storage. Create the bucket in `europe-west1`, then deploy with `firebase deploy --only storage`.
- **Cloud Functions** (region `europe-west1`) for the AI service and opportunity ingestion.
- Before upgrading: Billing > Budgets & alerts, set a monthly budget with email alerts at 50%, 90% and 100%.
