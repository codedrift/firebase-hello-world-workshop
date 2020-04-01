# firebase-hello-world-workshop

## 1. New PWA web app (react)

```bash
npx create-react-app firebase-hello-world-workshop --template typescript
```

Start app
```bash
npm start
```

## 2. Setup firebase project

1. [firebase.com](https://console.firebase.google.com/)
2. Add new project
   1. Call it whatever you like e.g. `firebase-hello-world-workshop`
   2. No need for analytics
3. Register a new web app
   1. Call it whatever you like e.g. `my-web-app`
   2. Also set up hosting (checkbox)
   3. Init firestore
      1. Select correct region (eu-west)
      2. Start in test mode (not secure!)
4. Install firebase tools globally
   1. `npm install -g firebase-tools`
   2. `firebase login`
   3. `firebase init`
      1. Select existing project from step
      2. Select `Firestore` and `Hosting` for setup
      3. Select default location for `firestore.rules` and `firestore.indexes.json`
      4. Set `build` as public web directory
      5. Answer `yes` when asked for single page setup
5. Run `firebase deploy`
6. [Look at what you've done (The app should be deployed now!](https://fir-hello-world-workshop-d5076.firebaseapp.com/)