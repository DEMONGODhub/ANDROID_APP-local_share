#!/usr/bin/env bash
# Run ONCE on your own computer. Creates your private signing key. Never upload, share or commit it.
set -e
cd "$(dirname "$0")/.."
[ -f localshare.jks ] && { echo "localshare.jks already exists - not overwriting."; exit 1; }
keytool -genkeypair -v -keystore localshare.jks -alias localshare -keyalg RSA -keysize 4096 -validity 36500 \
  -dname "CN=DEMON_GOD, O=LocalShare, C=IN"
read -rsp "Re-type the password you just chose (saved only in keystore.properties on this computer): " pw; echo
printf 'storeFile=localshare.jks\nstorePassword=%s\nkeyAlias=localshare\nkeyPassword=%s\n' "$pw" "$pw" > keystore.properties
echo "Done. BACK UP localshare.jks + the password in 2 places (USB + password manager). Lose it = you can never update the app."
