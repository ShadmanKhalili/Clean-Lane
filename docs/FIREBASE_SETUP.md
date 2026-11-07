# Firebase setup for the live pitch demo

This guide turns on live sync for the Clean Lane pitch demo. Once it is set up,
phones in the audience can join a room and their bookings appear on the big
screen in real time.

Without Firebase, the app still runs in **offline backup mode**. In that mode,
only tabs in the same browser on one device sync, so audience phones cannot join.

## What you need

- A Google account
- Access to the Netlify site for Clean Lane
- About 30 minutes

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Give it a name such as `clean-lane-pitch`.
3. Google Analytics is not needed. Turn it off and create the project.

## 2. Create the Realtime Database

1. In the left menu, go to **Build → Realtime Database**.
2. Click **Create database**.
3. Choose a location. We recommend **asia-southeast1 (Singapore)** as the closest
   region to Dhaka. This is a recommendation, not a requirement.
4. Choose **Start in locked mode** and click **Enable**.

The database URL on this page looks like
`https://<project-id>-default-rtdb.asia-southeast1.firebasedatabase.app`.
You will need it in step 4.

## 3. Publish the security rules

The rules live in `database.rules.json` in this repository.

1. Open `database.rules.json` and copy the whole file.
2. In the Realtime Database page, open the **Rules** tab, replace the contents
   with the copied text, and click **Publish**.

What the rules do:

- Only `rooms/{4-character code}/bookings` can be read or written. Every other
  path is refused.
- Each booking must match a strict shape (allowed areas, materials, stages and a
  hash chain). Anything that does not match is refused.

There is no login, so the room code is the only barrier. That is fine for a
pitch. It is not fine for production.

## 4. Copy the web app config

1. Click the gear icon, then **Project settings**.
2. Under **Your apps**, click the web icon (`</>`) to add a web app. Give it any
   nickname. Skip Firebase Hosting.
3. Copy the values from the `firebaseConfig` block into the variables below.

| Firebase config field | Environment variable |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` (optional, not used by the demo) |
| `databaseURL` | `VITE_FIREBASE_DATABASE_URL` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

If `databaseURL` is missing from the config block, copy it from the top of the
Realtime Database page instead.

The app needs `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_DATABASE_URL` and
`VITE_FIREBASE_PROJECT_ID` to switch to live mode. Without all three, it falls
back to offline backup mode.

## 5. Put the values in the right places

**Locally:** create a file named `.env.local` in the project root. Copy the
names from `.env.example` and fill in the values:

```
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_DATABASE_URL="https://..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_APP_ID="..."
```

The `.env*` pattern is in `.gitignore`, so this file will not be committed.
Restart `npm run dev` after editing it.

**On the deployed site:** go to Netlify → your site → **Site configuration** →
**Environment variables** and add the same five variables. Menu names can
change, so look for the equivalent page if needed.

Vite bakes these values into the app at build time. After changing them on
Netlify, trigger a new deploy (**Deploys → Trigger deploy → Deploy site**).

## 6. About these values being "public"

The web config values are not secrets. Anyone who loads the site can see them,
and that is by design. Access is controlled by the rules in step 3.

Keep them out of git anyway, as this setup does, so the project stays tidy and
easy to move between accounts.

## 7. Check that it works

1. Open `https://<your-site>/?pitch`. The badge should say **Live**, not
   **Offline backup**. (The big-screen badge is still being built. If you do not
   see it yet, check the browser console for Firebase errors instead.)
2. Open a join link on a phone using **mobile data**, not venue Wi-Fi. The link
   looks like `https://<your-site>/?join=ROOM`. Add a booking and confirm it
   appears on the big screen.

## 8. Optional: test locally with the emulator

The emulator runs a fake Realtime Database on your laptop. It applies the same
rules, so you can test without touching the real database.

1. In one terminal, start the emulator:

   ```
   npx firebase-tools emulators:start --only database --project demo-cleanlane
   ```

   The first run downloads the emulator. It uses port 9000, as set in
   `firebase.json`. You do not need to log in to Firebase for this.

2. In a second terminal, run the emulator tests:

   ```
   npm run test:firebase
   ```

   The tests check that a booking syncs through the whole journey and that bad
   writes are refused. The emulator applies the rules to the namespace
   `demo-cleanlane-default-rtdb`.

If the emulator fails to start, read the error. The database emulator has needed
extra local software in the past.

To point the app itself at the emulator, set `VITE_FIREBASE_EMULATOR_HOST` to
`127.0.0.1:9000` and set `VITE_FIREBASE_DATABASE_URL` to
`http://127.0.0.1:9000?ns=demo-cleanlane-default-rtdb`. Do this only in
`.env.local` on your laptop, never on Netlify.

## 9. After the pitch

- **Clear the room data (optional):** in the Realtime Database **Data** tab,
  open `rooms` and delete the room. Or press **R** on the big screen before you
  close it (planned, see the runbook).
- **Lock the rules (optional):** replace the rules with `{ "rules": { ".read": false, ".write": false } }`
  and publish. The live demo will stop working until you restore the rules.

## 10. Free plan limits

The free (Spark) plan should be ample for a room of a few hundred phones. Check
the usage page in the Firebase console before the event if you expect more.
