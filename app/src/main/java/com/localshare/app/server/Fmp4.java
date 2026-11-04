package com.localshare.app.server;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Minimal fragmented-MP4 writer for one H.264 video track, so a browser can play the phone's hardware-encoded
 * screen with Media Source Extensions. One init segment, then one moof+mdat per frame. Plain Java: no Android classes.
 */
public final class Fmp4 {
    private static final int TIMESCALE = 90000;
    private final ByteArrayOutputStream tmp = new ByteArrayOutputStream();
    private long seq, lastPts = -1;
    // each frame is held until the next one arrives, so its length is the real time to the next frame (no gaps for the browser to stall on)
    private byte[] pendSample;
    private long pendDts;
    private boolean pendKey, outKey;

    /** Splits an Annex-B buffer (00 00 01 / 00 00 00 01 start codes) into NAL units without the start codes. */
    public static List<byte[]> splitNals(byte[] b, int off, int len) {
        List<byte[]> out = new ArrayList<byte[]>();
        int i = off, end = off + len, start = -1;
        while (i + 2 < end) {
            if (b[i] == 0 && b[i + 1] == 0 && b[i + 2] == 1) {
                if (start >= 0) out.add(trim(b, start, i));
                start = i + 3;
                i += 3;
            } else i++;
        }
        if (start >= 0 && start < end) out.add(trim(b, start, end));
        return out;
    }

    private static byte[] trim(byte[] b, int s, int e) {
        while (e > s && b[e - 1] == 0) e--; // the zero of a 4-byte start code belongs to the next unit
        byte[] r = new byte[e - s];
        System.arraycopy(b, s, r, 0, r.length);
        return r;
    }

    /** "avc1.PPCCLL" for the MediaSource type string, from an SPS NAL (with its header byte). */
    public static String codecString(byte[] sps) {
        return String.format("avc1.%02x%02x%02x", sps[1] & 255, sps[2] & 255, sps[3] & 255);
    }

    /** ftyp + moov for the given SPS/PPS (NAL units without start codes). */
    public byte[] init(byte[] sps, byte[] pps, int w, int h) {
        seq = 0; lastPts = -1; pendSample = null;
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        w(o, box("ftyp", cat(str("isom"), i32(512), str("isom"), str("iso6"), str("avc1"), str("mp41"))));
        byte[] avcc = new byte[11 + sps.length + pps.length];
        int p = 0;
        avcc[p++] = 1; avcc[p++] = sps[1]; avcc[p++] = sps[2]; avcc[p++] = sps[3]; avcc[p++] = (byte) 0xff; avcc[p++] = (byte) 0xe1;
        avcc[p++] = (byte) (sps.length >> 8); avcc[p++] = (byte) sps.length;
        System.arraycopy(sps, 0, avcc, p, sps.length); p += sps.length;
        avcc[p++] = 1; avcc[p++] = (byte) (pps.length >> 8); avcc[p++] = (byte) pps.length;
        System.arraycopy(pps, 0, avcc, p, pps.length);
        byte[] avc1 = box("avc1", cat(new byte[6], i16(1), new byte[16], i16(w), i16(h), i32(0x00480000), i32(0x00480000), i32(0), i16(1),
                new byte[32], i16(0x18), i16(0xffff), box("avcC", avcc)));
        byte[] stbl = box("stbl", cat(
                full("stsd", 0, 0, cat(i32(1), avc1)),
                full("stts", 0, 0, i32(0)), full("stsc", 0, 0, i32(0)), full("stsz", 0, 0, cat(i32(0), i32(0))), full("stco", 0, 0, i32(0))));
        byte[] minf = box("minf", cat(full("vmhd", 0, 1, new byte[8]),
                box("dinf", full("dref", 0, 0, cat(i32(1), full("url ", 0, 1, new byte[0])))), stbl));
        byte[] mdia = box("mdia", cat(
                full("mdhd", 0, 0, cat(i32(0), i32(0), i32(TIMESCALE), i32(0), i16(0x55c4), i16(0))),
                full("hdlr", 0, 0, cat(i32(0), str("vide"), new byte[12], new byte[]{'V', 'i', 'd', 'e', 'o', 0})), minf));
        byte[] matrix = cat(i32(0x10000), i32(0), i32(0), i32(0), i32(0x10000), i32(0), i32(0), i32(0), i32(0x40000000));
        byte[] tkhd = full("tkhd", 0, 7, cat(i32(0), i32(0), i32(1), i32(0), i32(0), new byte[8], i16(0), i16(0), i16(0), i16(0), matrix, i32(w << 16), i32(h << 16)));
        byte[] trak = box("trak", cat(tkhd, mdia));
        byte[] mvhd = full("mvhd", 0, 0, cat(i32(0), i32(0), i32(1000), i32(0), i32(0x10000), i16(0x100), i16(0), new byte[8], matrix, new byte[24], i32(2)));
        byte[] mvex = box("mvex", full("trex", 0, 0, cat(i32(1), i32(1), i32(0), i32(0), i32(0))));
        w(o, box("moov", cat(mvhd, trak, mvex)));
        return o.toByteArray();
    }

    /**
     * One frame as moof+mdat. {@code annexB} is the encoder's output; parameter sets and SEI are dropped and the rest is
     * written with length prefixes. Returns the PREVIOUS frame's fragment (see {@link #lastKey()}), or null for the first frame
     * and when this one holds no picture data.
     */
    public byte[] fragment(byte[] annexB, int off, int len, long ptsUs, boolean key) {
        tmp.reset();
        for (byte[] nal : splitNals(annexB, off, len)) {
            if (nal.length == 0) continue;
            int t = nal[0] & 31;
            if (t != 1 && t != 5) continue;
            w(tmp, i32(nal.length));
            w(tmp, nal);
        }
        if (tmp.size() == 0) return null;
        byte[] sample = tmp.toByteArray();
        long dts = ptsUs * TIMESCALE / 1000000L;
        if (lastPts >= 0 && dts <= lastPts) dts = lastPts + 1;
        lastPts = dts;
        byte[] out = null;
        if (pendSample != null) { out = emit(pendSample, pendDts, Math.max(1, dts - pendDts), pendKey); outKey = pendKey; }
        pendSample = sample; pendDts = dts; pendKey = key;
        return out;
    }

    /** Whether the fragment returned by the last {@link #fragment} call starts with a key frame. */
    public boolean lastKey() { return outKey; }

    private byte[] emit(byte[] sample, long dts, long dur, boolean key) {
        byte[] mfhd = full("mfhd", 0, 0, i32((int) ++seq));
        byte[] tfhd = full("tfhd", 0, 0x20000, i32(1));
        byte[] tfdt = full("tfdt", 1, 0, cat(i32((int) (dts >>> 32)), i32((int) dts)));
        // trun: data offset, sample duration, size, flags
        int moofSize = 8 + mfhd.length + 8 + tfhd.length + tfdt.length + (12 + 4 + 4 + 12);
        byte[] trun = full("trun", 0, 0x701, cat(i32(1), i32(moofSize + 8), i32((int) dur), i32(sample.length), i32(key ? 0x02000000 : 0x01010000)));
        byte[] moof = box("moof", cat(mfhd, box("traf", cat(tfhd, tfdt, trun))));
        ByteArrayOutputStream o = new ByteArrayOutputStream(moof.length + sample.length + 8);
        w(o, moof);
        w(o, i32(sample.length + 8));
        w(o, str("mdat"));
        w(o, sample);
        return o.toByteArray();
    }

    private static byte[] box(String type, byte[] body) {
        return cat(i32(body.length + 8), str(type), body);
    }

    private static byte[] full(String type, int version, int flags, byte[] body) {
        return box(type, cat(new byte[]{(byte) version, (byte) (flags >> 16), (byte) (flags >> 8), (byte) flags}, body));
    }

    private static byte[] cat(byte[]... parts) {
        int n = 0;
        for (byte[] p : parts) n += p.length;
        byte[] r = new byte[n];
        int o = 0;
        for (byte[] p : parts) { System.arraycopy(p, 0, r, o, p.length); o += p.length; }
        return r;
    }

    private static byte[] i32(int v) { return new byte[]{(byte) (v >> 24), (byte) (v >> 16), (byte) (v >> 8), (byte) v}; }
    private static byte[] i16(int v) { return new byte[]{(byte) (v >> 8), (byte) v}; }
    private static byte[] str(String s) { return new byte[]{(byte) s.charAt(0), (byte) s.charAt(1), (byte) s.charAt(2), (byte) s.charAt(3)}; }
    private static void w(ByteArrayOutputStream o, byte[] b) { o.write(b, 0, b.length); }
}
