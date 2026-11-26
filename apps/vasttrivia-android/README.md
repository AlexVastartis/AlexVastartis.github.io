# Vast Trivia for Android

Wraps the web game in `public/vast/trivia/` as an offline Android app (`com.vasttrivia.app`),
distributed on the Vast Apps shelf (vast-apps.fly.dev) the same way as Vast Arcade and Vast Library.

- `build.sh` builds and signs `out/vasttrivia-<version>.apk` (see the header for the tools it needs).
  Bump `versionCode` and `versionName` in `AndroidManifest.xml` for each release.
- The signing key is **not** in this repo. Updates must be signed with the same key, or phones
  will refuse to install over the old version.
- `shelf/` holds the files for the Fly site: `vasttrivia/index.html` and `vasttrivia/icon.png`
  (copy the APK next to them), plus `app-shelf-index.html`, the shelf home page with the
  Vast Trivia card added.
