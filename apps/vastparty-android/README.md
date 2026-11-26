# Vast Party Games for Android

Wraps the web app in `public/vast/party/` as an offline Android app (`com.vastparty.app`),
distributed on the Vast Apps shelf (vast-apps.fly.dev). The screen stays on while it's open.

- `build.sh` builds and signs `out/vastparty-<version>.apk`. Bump `versionCode` and
  `versionName` in `AndroidManifest.xml` for each release.
- The signing key is **not** in this repo. Updates must be signed with the same key.
- The launcher icon comes from `apps/shelf/icons/party.png`.
