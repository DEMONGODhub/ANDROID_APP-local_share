# Play Store listing (copy and paste)

**App name:** LocalShare
**Short description (80):** Share phone folders as a website on your Wi-Fi. Play, watch and chat together.
**Full description:**
Turn any folder on your phone into a website that every device on your Wi-Fi can open. No cloud, no account, no internet needed.

• Share folders with phones, laptops and TVs through a link or QR code
• Invite links that expire, so friends join without the password
• Watch your screen live in smooth, sharp video with sound; viewers pick 480p to 1080p, pause and rewind the last 30 seconds
• Live chat with pictures and reactions, and a TV remote on the web page (you choose who may use it)
• Made to run for hours: the phone lowers the picture when it gets hot or the battery is low
• Photos, music, video (resume and subtitles), PDFs and text open right in the browser
• Orb Arena, a multiplayer game: teams, Battle Royale, host rules and a saved hall of fame
• You choose who gets in: passwords, approval, managers, per-device permissions
• Quick Settings tile and home-screen shortcuts
• Free, no ads, no tracking

**Category:** Tools   **Content rating:** Everyone (questionnaire: no violence beyond cartoon orbs, no user-generated content shared publicly)
**Privacy policy URL:** https://demongodhub.github.io/android_app/privacy.html  (turn on GitHub Pages: Settings → Pages → main /docs)
**Data safety form:** collects no data; shares no data; data stays on device. (Screen, sound and optional microphone voice go only to devices on the same network that the user lets in, are not recorded and not sent to the developer.)
**Permission justifications:** RECORD_AUDIO = capture the phone's sound for screen sharing and, only when the user switches it on, send their voice; FOREGROUND_SERVICE (special use / media projection / microphone) = keep file sharing and the live screen share running while the screen is off or the app is in the background; REQUEST_IGNORE_BATTERY_OPTIMIZATIONS = stop Android putting sharing to sleep.

## Screenshots to take (phone, 1080×1920, at least 2)
1. Home with the storage ring, the new logo and sharing on
2. Invite link + QR
3. Browser page showing files on a laptop
4. Screen sharing viewer
5. Orb Arena with teams
6. Game rules + hall of fame

## Steps
1. Make an upload key once: `keytool -genkeypair -v -keystore release.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000` (keep the file and passwords safe, never share them).
2. `base64 -w0 release.jks` → add GitHub secrets KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD.
3. Actions → "Release (signed)" → Run workflow → download the .aab and upload it in Play Console (opt in to Play App Signing).
4. Play Console: create app, paste the listing above, add screenshots, fill Data safety and content rating, submit.
