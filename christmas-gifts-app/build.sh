#!/bin/bash
# Builds ChristmasGifts.apk with the Ubuntu Android toolchain (no Gradle).
# Needs: apt install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23
set -e
cd "$(dirname "$0")"
SDK=/usr/lib/android-sdk
JAR=$SDK/platforms/android-23/android.jar
rm -rf build && mkdir -p build/gen build/classes
aapt package -f -m -J build/gen -M AndroidManifest.xml -S res -A assets -I "$JAR" -F build/unsigned.apk
javac -source 8 -target 8 -bootclasspath "$JAR" -d build/classes build/gen/com/alexv/giftlist/R.java src/com/alexv/giftlist/*.java 2>&1 | grep -v "warning" || true
dalvik-exchange --dex --min-sdk-version=21 --output=build/classes.dex build/classes
(cd build && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 build/unsigned.apk build/aligned.apk
KS="${KEYSTORE:-giftlist.keystore}"; PASS="${KEYSTORE_PASS:-giftlist}"
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -alias giftlist -keyalg RSA -keysize 2048 \
  -validity 10000 -storepass "$PASS" -keypass "$PASS" -dname "CN=Gift List" >/dev/null 2>&1
apksigner sign --ks "$KS" --ks-pass "pass:$PASS" --key-pass "pass:$PASS" --out ChristmasGifts.apk build/aligned.apk
apksigner verify --verbose ChristmasGifts.apk | head -4
ls -la ChristmasGifts.apk
