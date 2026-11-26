package com.vastparty.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.Build;

import java.security.MessageDigest;

/**
 * Vast Family "this phone" record, shared between the Vast apps on one phone (one Android user).
 * MASTER COPY: AppShelf/vastphone/VastPhone.java (copied into each app with its package; see AppShelf/FAMILY.md).
 *
 * Each Vast app keeps one small JSON record: {code, name, nameT, dev, devT, fam}
 *   code = its Family ID ("" when not in a family), name = the person's name and nameT = when it was set,
 *   dev  = this phone's id and devT = when it was made, fam = the family's name (display only).
 * The other Vast apps read it through this app's content provider (VastPhone.Provider). Nothing else can:
 * the provider answers only callers whose package AND signing key are one of the four Vast apps below,
 * and a reader only trusts providers that pass the same check.
 */
public final class VastPhone {
    private VastPhone() {}

    /** package, app, SHA-256 of the signing certificate. */
    static final String[][] APPS = {
            {"com.vastarcade.app", "arcade", "669b0a6d4404b921d097cf9ceb30512912e18f3fdb4c9dbc8ee0aca5290ab82a"},
            {"com.vasttrivia.app", "trivia", "08b5bc9dd6f63e79e194db85497f7c11f45d9ec3fabffe4f746c1917db35db58"},
            {"com.vastparty.app", "party", "eccf5899179465bc4049aab939ab4a52ee3f634039b7e993d0a4c82cdcbecf59"},
            {"com.pocketlibrary", "library", "e854de3cba7b88ffa8d42eb369a6c4a2fb5d3a8708d9f488e10f75b495bb52a5"},
    };

    static String authority(String pkg) { return pkg + ".vastfamily"; }

    private static SharedPreferences prefs(Context c) { return c.getSharedPreferences("vastphone", Context.MODE_PRIVATE); }

    /** This app's record (JSON text), as the app last published it. */
    static String load(Context c) { return prefs(c).getString("json", "{}"); }

    static void save(Context c, String json) {
        if (json == null || json.length() > 4000) return;
        prefs(c).edit().putString("json", json).commit();
    }

    /** True if pkg is one of the Vast apps and is signed with that app's key. */
    static boolean trusted(Context c, String pkg) {
        if (pkg == null) return false;
        String want = null;
        for (String[] a : APPS) if (a[0].equals(pkg)) want = a[2];
        if (want == null) return false;
        try {
            PackageManager pm = c.getPackageManager();
            Signature[] sigs;
            if (Build.VERSION.SDK_INT >= 28) {
                PackageInfo pi = pm.getPackageInfo(pkg, PackageManager.GET_SIGNING_CERTIFICATES);
                if (pi.signingInfo == null || pi.signingInfo.hasMultipleSigners()) return false;
                sigs = pi.signingInfo.getSigningCertificateHistory();
            } else {
                @SuppressWarnings("deprecation")
                PackageInfo pi = pm.getPackageInfo(pkg, PackageManager.GET_SIGNATURES);
                sigs = pi.signatures;
            }
            if (sigs == null) return false;
            for (Signature s : sigs) if (want.equals(sha256(s.toByteArray()))) return true;
        } catch (Exception e) { /* not installed */ }
        return false;
    }

    private static String sha256(byte[] b) throws Exception {
        byte[] d = MessageDigest.getInstance("SHA-256").digest(b);
        StringBuilder s = new StringBuilder();
        for (byte x : d) s.append(String.format("%02x", x & 0xff));
        return s.toString();
    }

    /** The other Vast apps on this phone: JSON array [{"app":"arcade","phone":{...}}] (only apps that answer and pass the key check). */
    static String siblings(Context c) {
        StringBuilder out = new StringBuilder("[");
        String me = c.getPackageName();
        for (String[] a : APPS) {
            if (a[0].equals(me) || !trusted(c, a[0])) continue;
            Cursor cur = null;
            try {
                cur = c.getContentResolver().query(Uri.parse("content://" + authority(a[0]) + "/phone"), null, null, null, null);
                if (cur != null && cur.moveToFirst()) {
                    String j = cur.getString(0);
                    if (j != null && j.startsWith("{") && j.length() <= 4000) {
                        if (out.length() > 1) out.append(',');
                        out.append("{\"app\":\"").append(a[1]).append("\",\"phone\":").append(j).append('}');
                    }
                }
            } catch (Exception e) { /* older version without the provider, or not reachable */ }
            finally { if (cur != null) cur.close(); }
        }
        return out.append(']').toString();
    }

    /** Answers the other Vast apps (and nobody else) with this app's record. */
    public static class Provider extends ContentProvider {
        @Override public boolean onCreate() { return true; }

        @Override
        public Cursor query(Uri uri, String[] projection, String selection, String[] args, String sort) {
            Context c = getContext();
            String caller = getCallingPackage();
            if (c == null || caller == null || caller.equals(c.getPackageName()) || !trusted(c, caller))
                throw new SecurityException("Vast apps only");
            MatrixCursor m = new MatrixCursor(new String[]{"json"});
            m.addRow(new Object[]{load(c)});
            return m;
        }

        @Override public String getType(Uri uri) { return null; }
        @Override public Uri insert(Uri uri, ContentValues v) { return null; }
        @Override public int delete(Uri uri, String s, String[] a) { return 0; }
        @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
    }
}
