#!/usr/bin/env bash
# Builds Vast Trivia's Android APK from the web app in public/vast/trivia.
#
#   KEYSTORE=/path/vasttrivia.keystore KEYSTORE_PASS=... apps/vasttrivia-android/build.sh
#
# Needs (Ubuntu): apt-get install aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange
# plus a JDK. The keystore is NOT in the repo: keep it safe, every update must be signed
# with the same key or phones will refuse to install it over the old version.
# Output: apps/vasttrivia-android/out/vasttrivia-<version>.apk
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
sdk=/usr/lib/android-sdk/platforms/android-23/android.jar
: "${KEYSTORE:?set KEYSTORE}" "${KEYSTORE_PASS:?set KEYSTORE_PASS}"
version=$(sed -n 's/.*android:versionName="\([^"]*\)".*/\1/p' "$here/AndroidManifest.xml")

b="$here/build"; rm -rf "$b"; mkdir -p "$b/assets/www" "$b/classes" "$here/out"

# web app -> assets/www (web-only bits stripped: service worker, hub link, web fonts)
cp -r "$root/public/vast/trivia/q" "$root/public/vast/trivia/app.js" "$root/public/vast/trivia/style.css" "$b/assets/www/"
perl -0pe 's/<!--web-->.*?<!--\/web-->\n?//gs' "$root/public/vast/trivia/index.html" > "$b/assets/www/index.html"
if grep -q 'serviceWorker\|fonts.googleapis\|manifest.webmanifest' "$b/assets/www/index.html"; then echo "strip failed" >&2; exit 1; fi

javac -nowarn -source 8 -target 8 -bootclasspath "$sdk" -d "$b/classes" "$here"/src/com/vasttrivia/app/*.java 2>&1 | grep -v 'warning: \[options\]' || true
dalvik-exchange --dex --min-sdk-version=21 --output="$b/classes.dex" "$b/classes"

aapt package -f -M "$here/AndroidManifest.xml" -S "$here/res" -A "$b/assets" -I "$sdk" -F "$b/unsigned.apk"
(cd "$b" && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 "$b/unsigned.apk" "$b/aligned.apk"
out="$here/out/vasttrivia-$version.apk"
apksigner sign --ks "$KEYSTORE" --ks-pass "pass:$KEYSTORE_PASS" --min-sdk-version 21 --out "$out" "$b/aligned.apk"
rm -f "$out.idsig"
apksigner verify "$out"
echo "$out ($(du -h "$out" | cut -f1))"
