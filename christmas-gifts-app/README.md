# Christmas Gift List (Android)

Small offline Android app (WebView + local HTML) for the family Christmas list.
It mirrors the "Christmas List" Google Sheet: one tab per year, each kid gets the same
slots every year (A & J, sibling gifts, Shark Tree = Santa, Stocking+, Stocking), and
status is Idea → Purchased → Wrapped (the sheet's fill colors).

- **Import**: Google Sheets → File → Download → .xlsx, then ⋮ → Import spreadsheet in the app.
- **Compare**: kids side by side, like the sheet. **To do**: shopping / wrapping checklists.
- **History**: search every year. 🦈 hides Shark gifts when kids are around.

Build: `./build.sh` (needs `apt install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23`).
Optional: `node tools/make-seed.cjs "Christmas List.xlsx"` bakes the sheet into the APK as
`assets/seed.js`. That file and the APK contain family data and are gitignored. Don't commit them.

Signing: `build.sh` makes `giftlist.keystore` the first time it runs. The keystore is gitignored:
keep your copy safe, because Android only installs updates signed with the same key.
