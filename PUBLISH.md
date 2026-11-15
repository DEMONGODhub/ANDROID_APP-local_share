# Publishing LocalShare as yours

## 1. Make the signing key (once, on your own computer)
```
./tools/make-keystore.sh
```
Creates `localshare.jks` + `keystore.properties` (both git-ignored). **Back them up in 2 places.** Never send them to anyone, including Claude. Lose the key = you can never update the app.

Build signed files in Android Studio: *Build > Generate Signed Bundle / APK*, or `./gradlew assembleRelease bundleRelease`
- `app/build/outputs/apk/release/*.apk` -> website, GitHub, other stores
- `app/build/outputs/bundle/release/*.aab` -> Google Play

Always sign with the same key; an APK signed differently will not install over the old one.

## 2. Your website + GitHub Releases (free, today)
1. GitHub repo > Releases > Draft new release > tag `v2.36.2` > attach the signed APK.
2. Repo > Settings > Pages > Source: `main`, folder `/docs`. Your page appears at `https://demongodhub.github.io/android_app-local_share/` (landing page `docs/index.html`, privacy page `docs/privacy.html`).
3. Link that page from demongod.freedev.app.

## 3. Google Play ($25 one-time)
1. Create a developer account at play.google.com/console (identity check; personal accounts made recently need 12 testers for 14 days before production).
2. New app > upload the `.aab` > turn on **Play App Signing** (your key becomes the upload key).
3. Fill the listing from `store/listing.md`; screenshots from `store/screenshots/`.
4. Privacy policy URL = your Pages URL + `/privacy.html`.
5. Data safety form: nothing leaves the device or goes to you; no ads; no analytics.
6. Declarations Play will ask about (answer honestly, explain in plain words):
   - Foreground service *special use* (hosting the server) and *media projection* (screen sharing) and *microphone*.
   - **Ignore battery optimisations** is a restricted permission on Play. It may be rejected; if so, remove `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` for the Play build and keep the Settings > Battery > Unrestricted instructions.
7. Content rating questionnaire, target audience 13+, then submit for review.

## 4. Other stores (free, usually quick)
Aptoide, APKPure, Amazon Appstore, Samsung Galaxy Store: upload the same signed APK, reuse `store/listing.md`.

## 5. Before every release
Bump `versionCode` and `versionName`, update `CHANGELOG.md`, rebuild, test on a real phone, attach the APK to a new GitHub Release.

## Known gaps
- Kotlin code in recent versions has not been compiled or run on a device by me; test the signed build first.
- LICENSE is "all rights reserved, personal use": fine for being yours, but F-Droid would need an open-source licence.
