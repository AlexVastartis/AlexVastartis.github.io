#!/usr/bin/env bash
# Builds Vast Party Games' Android APK from the web app in public/vast/party.
#
#   KEYSTORE=/path/vastparty.keystore KEYSTORE_PASS=... apps/vastparty-android/build.sh
#
# Needs (Ubuntu): apt-get install aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange
# plus a JDK. The keystore is NOT in the repo: keep it safe, every update must be signed
# with the same key or phones will refuse to install it over the old version.
# Output: apps/vastparty-android/out/vastparty-<version>.apk
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
sdk=/usr/lib/android-sdk/platforms/android-23/android.jar
: "${KEYSTORE:?set KEYSTORE}" "${KEYSTORE_PASS:?set KEYSTORE_PASS}"
version=$(sed -n 's/.*android:versionName="\([^"]*\)".*/\1/p' "$here/AndroidManifest.xml")

b="$here/build"; rm -rf "$b"; mkdir -p "$b/assets/www" "$b/classes" "$b/res" "$here/out"

# web app -> assets/www (web-only bits stripped: manifest, service worker)
cp "$root/public/vast/party/icon.svg" "$b/assets/www/"
perl -0pe 's/<!--web-->.*?<!--\/web-->\n?//gs' "$root/public/vast/party/index.html" > "$b/assets/www/index.html"
# Vast Family: index.html loads ../family.js. The app is served from https://appassets.androidplatform.net/index.html,
# where ../family.js resolves to /family.js = assets/www/family.js (also one level up, for file:///android_asset/www/).
cp "$root/public/vast/family.js" "$b/assets/www/family.js"
cp "$root/public/vast/family.js" "$b/assets/family.js"
if grep -q 'manifest.webmanifest' "$b/assets/www/index.html"; then echo "strip failed" >&2; exit 1; fi

# launcher icons from apps/shelf/icons/party.png
for d in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  mkdir -p "$b/res/mipmap-${d%%:*}"
  python3 -c "import sys;from PIL import Image;Image.open(sys.argv[1]).resize((int(sys.argv[3]),)*2,Image.LANCZOS).save(sys.argv[2])" \
    "$root/apps/shelf/icons/party.png" "$b/res/mipmap-${d%%:*}/ic_launcher.png" "${d##*:}"
done
# Android 8+ adaptive icon (indigo background + foreground layer), made by apps/shelf/icons/make_icons.py --adaptive
cp -r "$here/res/." "$b/res/"

javac -nowarn -source 8 -target 8 -bootclasspath "$sdk" -d "$b/classes" "$here"/src/com/vastparty/app/*.java 2>&1 | grep -v 'warning: \[options\]' || true
dalvik-exchange --dex --min-sdk-version=21 --output="$b/classes.dex" "$b/classes"

aapt package -f -M "$here/AndroidManifest.xml" -S "$b/res" -A "$b/assets" -I "$sdk" -F "$b/unsigned.apk"
(cd "$b" && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 "$b/unsigned.apk" "$b/aligned.apk"
out="$here/out/vastparty-$version.apk"
apksigner sign --ks "$KEYSTORE" --ks-pass "pass:$KEYSTORE_PASS" --min-sdk-version 21 --out "$out" "$b/aligned.apk"
rm -f "$out.idsig"
apksigner verify "$out"
echo "$out ($(du -h "$out" | cut -f1))"
