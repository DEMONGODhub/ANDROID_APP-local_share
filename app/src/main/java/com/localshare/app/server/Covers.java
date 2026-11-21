package com.localshare.app.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** Pulls an embedded picture out of a file: album art from MP3 (ID3v2) and the preview image stored in Office/OpenDocument files. */
public final class Covers {
    private static final int MAX = 4 * 1024 * 1024;

    private Covers() {}

    private static byte[] readN(InputStream in, int n) throws IOException {
        byte[] b = new byte[n];
        int o = 0;
        while (o < n) {
            int r = in.read(b, o, n - o);
            if (r < 0) return null;
            o += r;
        }
        return b;
    }

    private static boolean skipN(InputStream in, long n) throws IOException {
        while (n > 0) {
            long s = in.skip(n);
            if (s <= 0) {
                if (in.read() < 0) return false;
                s = 1;
            }
            n -= s;
        }
        return true;
    }

    /** Album art from an ID3v2.3/2.4 tag (frame APIC), or null. */
    public static byte[] audio(InputStream in) throws IOException {
        byte[] h = readN(in, 10);
        if (h == null || h[0] != 'I' || h[1] != 'D' || h[2] != '3') return null;
        int ver = h[3];
        if (ver != 3 && ver != 4) return null;
        long size = ((h[6] & 127) << 21) | ((h[7] & 127) << 14) | ((h[8] & 127) << 7) | (h[9] & 127);
        long left = Math.min(size, 16L * 1024 * 1024);
        if ((h[5] & 0x40) != 0) { // extended header
            byte[] x = readN(in, 4);
            if (x == null) return null;
            long xs = ver == 4 ? ((x[0] & 127) << 21) | ((x[1] & 127) << 14) | ((x[2] & 127) << 7) | (x[3] & 127) : (((x[0] & 255L) << 24) | ((x[1] & 255) << 16) | ((x[2] & 255) << 8) | (x[3] & 255)) + 0;
            if (ver == 4) xs -= 4;
            if (xs < 0 || !skipN(in, xs)) return null;
            left -= 4 + xs;
        }
        while (left >= 10) {
            byte[] f = readN(in, 10);
            if (f == null || f[0] == 0) return null;
            long fs = ver == 4
                    ? ((f[4] & 127) << 21) | ((f[5] & 127) << 14) | ((f[6] & 127) << 7) | (f[7] & 127)
                    : ((f[4] & 255L) << 24) | ((f[5] & 255) << 16) | ((f[6] & 255) << 8) | (f[7] & 255);
            left -= 10 + fs;
            if (fs < 0 || left < 0) return null;
            if (f[0] == 'A' && f[1] == 'P' && f[2] == 'I' && f[3] == 'C') {
                if (fs < 8 || fs > MAX) return null;
                byte[] d = readN(in, (int) fs);
                return d == null ? null : apic(d);
            }
            if (!skipN(in, fs)) return null;
        }
        return null;
    }

    private static byte[] apic(byte[] d) {
        int enc = d[0];
        int i = 1;
        while (i < d.length && d[i] != 0) i++; // mime type
        i += 2; // terminator + picture type
        if (i >= d.length) return null;
        if (enc == 1 || enc == 2) { // UTF-16 description ends with 00 00
            while (i + 1 < d.length && !(d[i] == 0 && d[i + 1] == 0)) i += 2;
            i += 2;
        } else {
            while (i < d.length && d[i] != 0) i++;
            i++;
        }
        if (i >= d.length) return null;
        byte[] img = new byte[d.length - i];
        System.arraycopy(d, i, img, 0, img.length);
        return looksLikeImage(img) ? img : null;
    }

    /** The preview picture saved inside a .docx/.xlsx/.pptx (docProps/thumbnail.*) or .odt/.ods/.odp (Thumbnails/thumbnail.png), or null. */
    public static byte[] document(InputStream in) throws IOException {
        try (ZipInputStream z = new ZipInputStream(in)) {
            ZipEntry e;
            int seen = 0;
            while ((e = z.getNextEntry()) != null && seen++ < 400) {
                String n = e.getName().toLowerCase(java.util.Locale.ROOT);
                if (n.equals("docprops/thumbnail.jpeg") || n.equals("docprops/thumbnail.jpg") || n.equals("docprops/thumbnail.png") || n.equals("thumbnails/thumbnail.png")) {
                    ByteArrayOutputStream o = new ByteArrayOutputStream();
                    byte[] buf = new byte[8192];
                    int r;
                    while ((r = z.read(buf)) > 0) {
                        o.write(buf, 0, r);
                        if (o.size() > MAX) return null;
                    }
                    byte[] img = o.toByteArray();
                    return looksLikeImage(img) ? img : null;
                }
            }
        }
        return null;
    }

    public static boolean looksLikeImage(byte[] b) {
        if (b.length < 8) return false;
        boolean jpg = (b[0] & 255) == 0xFF && (b[1] & 255) == 0xD8;
        boolean png = (b[0] & 255) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        return jpg || png;
    }
}
