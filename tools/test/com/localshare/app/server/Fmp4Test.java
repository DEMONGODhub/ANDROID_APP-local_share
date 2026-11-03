package com.localshare.app.server;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/** Feeds an Annex-B H.264 file through Fmp4 and writes the result as an .mp4 for ffmpeg to decode. args: in.h264 out.mp4 */
public class Fmp4Test {
    public static void main(String[] a) throws Exception {
        byte[] src = Files.readAllBytes(Paths.get(a[0]));
        List<byte[]> nals = Fmp4.splitNals(src, 0, src.length);
        byte[] sps = null, pps = null;
        Fmp4 m = new Fmp4();
        ByteArrayOutputStream cur = new ByteArrayOutputStream();
        boolean key = false, wrote = false;
        long pts = 0;
        int frames = 0;
        FileOutputStream out = new FileOutputStream(a[1]);
        for (byte[] n : nals) {
            int t = n[0] & 31;
            if (t == 9) { // access unit delimiter: the previous frame is complete
                if (cur.size() > 0 && wrote) { byte[] f = m.fragment(cur.toByteArray(), 0, cur.size(), pts, key); out.write(f); frames++; pts += 33333; }
                cur.reset(); key = false;
                continue;
            }
            if (t == 7 && sps == null) sps = n;
            if (t == 8 && pps == null) pps = n;
            if (sps != null && pps != null && !wrote) { out.write(m.init(sps, pps, 320, 240)); wrote = true; }
            if (t == 5) key = true;
            cur.write(new byte[]{0, 0, 0, 1}, 0, 4);
            cur.write(n, 0, n.length);
        }
        if (cur.size() > 0) { out.write(m.fragment(cur.toByteArray(), 0, cur.size(), pts, key)); frames++; }
        out.close();
        System.out.println("FRAMES " + frames + " CODEC " + Fmp4.codecString(sps));
    }
}
