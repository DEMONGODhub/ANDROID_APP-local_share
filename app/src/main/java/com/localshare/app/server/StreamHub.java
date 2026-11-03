package com.localshare.app.server;

import java.util.ArrayDeque;

/** Holds the host's live screen: the newest JPEG frame plus a short queue of PCM audio chunks. Viewers pull from it. */
public final class StreamHub {
    private byte[] frame;
    private long seq;
    private volatile boolean live;
    private volatile long startedAt, lastFrameAt;
    private volatile int fps;
    private long winStart;
    private int winCount;
    private volatile int viewers;
    private volatile boolean audioSeen;
    private volatile int audioRate = 24000, audioCh = 2;
    private final ArrayDeque<byte[]> audio = new ArrayDeque<byte[]>();
    private long audioBase; // absolute index of audio.peekFirst()

    // hardware-encoded video: an init segment, then one fragment per frame; a joiner starts at the newest keyframe
    private byte[] vInit;
    private String vMime = "";
    private int vW, vH;
    private volatile long vEpoch;
    private final ArrayDeque<byte[]> vFrags = new ArrayDeque<byte[]>();
    private final ArrayDeque<Boolean> vKeys = new ArrayDeque<Boolean>();
    private long vBase, vLastKey = -1, vBytes;
    private static final int V_MAX_FRAGS = 400;
    private static final long V_MAX_BYTES = 12L << 20;
    /** What each viewer asked for (0 auto, 1 480p, 2 720p, 3 1080p) and when; the phone encodes one stream, so the highest recent request wins. */
    private final java.util.HashMap<String, long[]> wants = new java.util.HashMap<String, long[]>();
    private volatile int kbps;
    private volatile String note = "";
    private volatile long slowUntil;
    private volatile int slowCount;

    public boolean isLive() { return live; }
    /** True once the phone has sent any sound for this share. */
    public boolean hasAudio() { return live && audioSeen; }
    /** When the share began (ms since 1970), 0 when nothing is live. */
    public long startedAt() { return live ? startedAt : 0; }
    /** Frames per second the phone is producing right now. */
    public int fps() { return live ? fps : 0; }
    /** Milliseconds since the newest frame arrived. */
    public long frameAge() { return lastFrameAt == 0 ? Long.MAX_VALUE : System.currentTimeMillis() - lastFrameAt; }
    public int viewers() { return viewers; }
    public int audioRate() { return audioRate; }
    public int audioChannels() { return audioCh; }

    public synchronized void start(int rate, int channels) {
        frame = null; seq = 0; audio.clear(); audioBase = 0;
        wantVideo = false; vInit = null; vMime = ""; vFrags.clear(); vKeys.clear(); vBase = 0; vLastKey = -1; vBytes = 0; vEpoch++; kbps = 0; note = ""; slowCount = 0;
        audioRate = rate; audioCh = channels;
        live = true;
        audioSeen = false;
        startedAt = System.currentTimeMillis();
        lastFrameAt = 0; fps = 0; winStart = startedAt; winCount = 0;
        notifyAll();
    }

    public synchronized void stop() {
        live = false;
        frame = null;
        audio.clear();
        vInit = null; vFrags.clear(); vKeys.clear(); vLastKey = -1; vBytes = 0; vEpoch++;
        notifyAll();
    }

    public synchronized void pushFrame(byte[] jpeg) {
        if (!live) return;
        frame = jpeg;
        seq++;
        long now = System.currentTimeMillis();
        lastFrameAt = now;
        winCount++;
        if (now - winStart >= 1000) { fps = (int) Math.round(winCount * 1000.0 / (now - winStart)); winCount = 0; winStart = now; }
        notifyAll();
    }

    public synchronized void pushAudio(byte[] pcm) {
        if (!live) return;
        audioSeen = true;
        audio.addLast(pcm);
        while (audio.size() > 40) { audio.pollFirst(); audioBase++; }
        notifyAll();
    }

    /** Back to the JPEG stream: forget the hardware video so viewers switch to it. */
    public synchronized void clearVideo() {
        vInit = null; vMime = ""; vFrags.clear(); vKeys.clear(); vBase = 0; vLastKey = -1; vBytes = 0; wantVideo = false; vEpoch++;
        notifyAll();
    }

    /** The phone starts (or restarts, after a resolution change) its video: new init segment, old fragments dropped. */
    public synchronized void setVideo(byte[] init, String mime, int w, int h) {
        if (!live) return;
        vInit = init; vMime = mime; vW = w; vH = h;
        vFrags.clear(); vKeys.clear(); vBase = 0; vLastKey = -1; vBytes = 0;
        vEpoch++;
        notifyAll();
    }

    public synchronized void pushVideo(byte[] frag, boolean key) {
        if (!live || vInit == null) return;
        if (key) vLastKey = vBase + vFrags.size();
        vFrags.addLast(frag); vKeys.addLast(key); vBytes += frag.length;
        // trim from the front, but never past the newest keyframe: a joiner needs it
        while ((vFrags.size() > V_MAX_FRAGS || vBytes > V_MAX_BYTES) && vBase < vLastKey) { vBytes -= vFrags.pollFirst().length; vKeys.pollFirst(); vBase++; }
        long now = System.currentTimeMillis();
        lastFrameAt = now;
        winCount++;
        if (now - winStart >= 1000) { fps = (int) Math.round(winCount * 1000.0 / (now - winStart)); winCount = 0; winStart = now; }
        notifyAll();
    }

    private volatile boolean wantVideo;
    /** The phone is set up to send hardware video, which may take a moment to appear. */
    public void expectVideo(boolean on) { wantVideo = on; }
    public boolean expectsVideo() { return live && wantVideo && vInit == null; }

    public boolean hasVideo() { return live && vInit != null; }
    public synchronized byte[] videoInit() { return vInit; }
    public synchronized String videoMime() { return vMime; }
    public int videoWidth() { return vW; }
    public int videoHeight() { return vH; }
    public long videoEpoch() { return vEpoch; }

    /** Next fragment for a viewer whose cursor is {@code cur[0]} (-1 = join at the newest keyframe). Null on timeout. */
    synchronized byte[] nextVideo(long[] cur, long timeoutMs) throws InterruptedException {
        if (cur[0] < 0) cur[0] = Math.max(vBase, vLastKey);
        if (cur[0] < vBase) cur[0] = Math.max(vBase, vLastKey); // fell too far behind: jump to the newest keyframe
        if (live && cur[0] >= vBase + vFrags.size()) wait(timeoutMs);
        if (!live) return new byte[0];
        if (cur[0] < vBase) cur[0] = Math.max(vBase, vLastKey);
        if (cur[0] >= vBase + vFrags.size()) return null;
        byte[] r = null;
        long k = vBase;
        for (byte[] b : vFrags) { if (k == cur[0]) { r = b; break; } k++; }
        cur[0]++;
        return r;
    }

    /** A viewer's connection was slow to take data: the phone should lower its bitrate. */
    void noteSlow() { slowUntil = System.currentTimeMillis() + 3000; slowCount++; }
    /** Slow-viewer reports in the last 3 seconds (0 = everyone keeps up). */
    public int pressure() { return System.currentTimeMillis() < slowUntil ? slowCount : 0; }
    public void clearPressure() { slowCount = 0; slowUntil = 0; }

    public synchronized void want(String who, int q) {
        long now = System.currentTimeMillis();
        wants.put(who, new long[]{Math.max(0, Math.min(3, q)), now});
        for (java.util.Iterator<long[]> it = wants.values().iterator(); it.hasNext(); ) if (now - it.next()[1] > 8000) it.remove();
    }

    /** The picture quality to encode: the highest request from a viewer who asked in the last 8 seconds, or 0 (auto). */
    public synchronized int quality() {
        long now = System.currentTimeMillis();
        int best = 0;
        for (long[] w : wants.values()) if (now - w[1] <= 8000 && w[0] > best) best = (int) w[0];
        return best;
    }
    public int kbps() { return kbps; }
    public String note() { return note; }
    /** The phone reports its current bitrate and any warning (hot, low battery). */
    public void setInfo(int kbps, String note) { this.kbps = kbps; this.note = note == null ? "" : note; }

    void viewerDelta(int d) { synchronized (this) { viewers += d; } }

    /** Blocks until a frame newer than {@code last[0]} exists (or timeoutMs passes, returning the current one). Null when the stream ended. */
    synchronized byte[] nextFrame(long[] last, long timeoutMs) throws InterruptedException {
        if (live && seq == last[0]) wait(timeoutMs);
        if (!live) return null;
        last[0] = seq;
        return frame;
    }

    /** Next audio chunk for a listener whose cursor is {@code cur[0]} (absolute index; -1 = join at the live edge). Null on timeout. */
    synchronized byte[] nextAudio(long[] cur, long timeoutMs) throws InterruptedException {
        if (cur[0] < 0 || cur[0] < audioBase) cur[0] = Math.max(audioBase, audioBase + audio.size() - 2);
        if (live && cur[0] >= audioBase + audio.size()) wait(timeoutMs);
        if (!live) return new byte[0];
        long i = cur[0];
        if (i < audioBase) i = audioBase;
        if (i >= audioBase + audio.size()) return null;
        byte[] r = null;
        long k = audioBase;
        for (byte[] b : audio) { if (k == i) { r = b; break; } k++; }
        cur[0] = i + 1;
        return r;
    }
}
