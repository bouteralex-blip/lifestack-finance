# LifeStack Finance — Android App

A standalone, installable Android app for LifeStack Finance. It's a
[Capacitor](https://capacitorjs.com/) native shell: a real Android app (its
own icon, splash screen, and app-switcher entry) that loads the live
LifeStack Finance web app (`https://lifestack-finance.vercel.app`) inside a
full-screen WebView.

This approach was chosen deliberately: LifeStack Finance is a Next.js app
with server-side API routes, Supabase, and scheduled cron jobs (`app/api/*`,
`vercel.json`). None of that server logic can run inside a phone, so
rewriting the UI natively would either duplicate the whole backend or leave
the app disconnected from live data. Wrapping the deployed site keeps the
Android app perfectly in sync with the web app with zero duplicated logic.

## Project layout

```
android-app/
├── capacitor.config.json   # Points the WebView at the deployed URL
├── www/                    # Placeholder web root (required by Capacitor, never actually rendered)
├── android/                # Generated native Android Studio project
└── package.json
```

## Requirements

- Node.js 18+
- Android Studio (or the Android command-line SDK) + JDK 17/21
- An `ANDROID_HOME` / `ANDROID_SDK_ROOT` pointing at an installed SDK

## Building locally

```bash
cd android-app
npm install
npx cap sync android

# Debug APK, installable directly on a device/emulator:
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# Or open in Android Studio:
npx cap open android
```

## Building via CI

Push changes under `android-app/` (or manually trigger the workflow) and
GitHub Actions (`.github/workflows/android-app.yml`) builds a debug APK and
uploads it as a downloadable artifact — no local Android SDK required.

## Configuration

- **Target URL**: `server.url` in `capacitor.config.json`. Point it at a
  staging deployment or `http://10.0.2.2:3000` (emulator alias for
  `localhost`) during development, then run `npx cap sync android`.
- **App id / name**: `appId` / `appName` in `capacitor.config.json` (already
  applied to the generated native project as `com.lifestack.finance` /
  "LifeStack Finance").
- **Icon & splash screen**: replace the placeholder mipmap/drawable
  resources under `android/app/src/main/res/` with real branded assets
  (e.g. via `npx @capacitor/assets generate --android` fed with a source
  logo), then `npx cap sync android`.

## Releasing to the Play Store

1. Generate a signing keystore (keep it out of git):
   `keytool -genkey -v -keystore lifestack-release.keystore -alias lifestack -keyalg RSA -keysize 2048 -validity 10000`
2. Configure signing in `android/app/build.gradle` (a `release` signing
   config referencing the keystore, ideally via environment variables /
   Gradle properties rather than committed secrets).
3. Build the bundle: `cd android && ./gradlew bundleRelease` →
   `android/app/build/outputs/bundle/release/app-release.aab`
4. Upload the `.aab` to the Play Console.

## Notes

- Requires network connectivity — there is no offline mode, since the app
  depends on live server-rendered pages and API routes.
- Deep linking, push notifications, and other native capabilities can be
  added incrementally via additional Capacitor plugins
  (`@capacitor/push-notifications`, etc.) without touching the web app.
