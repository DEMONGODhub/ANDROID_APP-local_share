#!/usr/bin/env bash
# Creates YOUR release keystore once. Keep the .jks file and the passwords somewhere safe and backed up:
# if you lose them you can never update the app on Google Play under the same listing.
# Usage: tools/make-keystore.sh    (needs a JDK; `keytool` comes with it)
set -euo pipefail
OUT="${1:-localshare-release.jks}"
ALIAS="${2:-localshare}"
[ -e "$OUT" ] && { echo "$OUT already exists; not overwriting."; exit 1; }
keytool -genkeypair -v -keystore "$OUT" -alias "$ALIAS" -keyalg RSA -keysize 4096 -validity 36500
cat <<EOM

Done. Now either:
 A) local builds: create keystore.properties next to gradlew (it is git-ignored):
      storeFile=$OUT
      storePassword=<the store password you typed>
      keyAlias=$ALIAS
      keyPassword=<the key password you typed>
 B) GitHub builds: add repository secrets KEYSTORE_BASE64 ($(printf 'base64 -w0 %s' "$OUT")), KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
    and run Actions > Release (signed).
EOM
