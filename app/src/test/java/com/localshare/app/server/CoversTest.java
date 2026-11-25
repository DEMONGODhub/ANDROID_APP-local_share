package com.localshare.app.server;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.Test;

/** Plain JVM tests: run with ./gradlew testDebugUnitTest. */
public class CoversTest {
    private static final byte[] JPEG = new byte[]{(byte) 0xFF, (byte) 0xD8, 1, 2, 3, 4, 5, 6, 7, 8, (byte) 0xFF, (byte) 0xD9};

    private static byte[] mp3WithCover() throws Exception {
        ByteArrayOutputStream ap = new ByteArrayOutputStream();
        ap.write(0); ap.write("image/jpeg".getBytes()); ap.write(0); ap.write(3); ap.write(0); ap.write(JPEG);
        byte[] a = ap.toByteArray();
        ByteArrayOutputStream m = new ByteArrayOutputStream();
        int fl = 10 + a.length;
        m.write("ID3".getBytes()); m.write(3); m.write(0); m.write(0);
        m.write((fl >> 21) & 127); m.write((fl >> 14) & 127); m.write((fl >> 7) & 127); m.write(fl & 127);
        m.write("APIC".getBytes()); m.write(a.length >> 24); m.write(a.length >> 16); m.write(a.length >> 8); m.write(a.length); m.write(0); m.write(0); m.write(a);
        m.write(new byte[64]);
        return m.toByteArray();
    }

    private static byte[] zip(boolean withThumb) throws Exception {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        try (ZipOutputStream z = new ZipOutputStream(o)) {
            z.putNextEntry(new ZipEntry("word/document.xml")); z.write("<x/>".getBytes()); z.closeEntry();
            if (withThumb) { z.putNextEntry(new ZipEntry("docProps/thumbnail.jpeg")); z.write(JPEG); z.closeEntry(); }
        }
        return o.toByteArray();
    }

    @Test public void audioCoverIsFoundInId3v23() throws Exception {
        assertArrayEquals(JPEG, Covers.audio(new ByteArrayInputStream(mp3WithCover())));
    }

    @Test public void audioWithoutTagGivesNull() throws Exception {
        assertNull(Covers.audio(new ByteArrayInputStream(new byte[100])));
    }

    @Test public void documentPreviewIsFound() throws Exception {
        assertArrayEquals(JPEG, Covers.document(new ByteArrayInputStream(zip(true))));
    }

    @Test public void documentWithoutPreviewGivesNull() throws Exception {
        assertNull(Covers.document(new ByteArrayInputStream(zip(false))));
    }

    @Test public void imageSniffing() {
        assertTrue(Covers.looksLikeImage(JPEG));
        assertFalse(Covers.looksLikeImage(new byte[]{1, 2, 3, 4}));
    }
}
