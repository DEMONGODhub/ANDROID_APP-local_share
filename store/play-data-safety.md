# Google Play: Data safety form (answers)

Based on the code and docs/privacy.html. Re-check if you ever add analytics, ads, accounts or a cloud feature.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (no data leaves the phone for the developer). Note: traffic between the host phone and the browsers on the same Wi-Fi is plain HTTP. |
| Do you provide a way for users to request that their data be deleted? | Not applicable (nothing is collected). Everything is stored on the phone; uninstalling removes it. |
| Data types collected | None |
| Data types shared | None |
| Security practices | Data stays on the device; optional password and per-device permissions; the host can block devices |
| Privacy policy URL | https://demongodhub.github.io/android_app/privacy.html |

**Declarations to remember**
- Foreground service types: specialUse (file sharing), mediaProjection and microphone (screen share). Give the one-sentence justifications from `store/listing.md`.
- Target audience: 13+ is safest because the app has live chat between people on the same network.
- Ads: No. In-app purchases: No (donations, if any, go through an outside link).
