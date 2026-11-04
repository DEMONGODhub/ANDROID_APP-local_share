package com.localshare.app

import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioPlaybackCaptureConfiguration
import android.media.AudioRecord
import android.media.ImageReader
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.os.BatteryManager
import android.os.Bundle
import android.os.PowerManager
import android.view.Surface
import android.content.IntentFilter
import com.localshare.app.server.Fmp4
import com.localshare.app.server.StreamHub
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import java.io.ByteArrayOutputStream

/**
 * Shares the phone's screen with devices that were let in. The phone's video chip encodes it as H.264 (smooth, cool, light on the battery);
 * if that fails, or Compatibility mode is on, every frame becomes a JPEG instead.
 */
class CastService : Service() {
    private var projection: MediaProjection? = null
    private var display: VirtualDisplay? = null
    private var reader: ImageReader? = null
    private var thread: HandlerThread? = null
    private var handler: Handler? = null
    @Volatile private var lastJpeg: ByteArray? = null
    @Volatile private var lastAt = 0L
    private var repeating = false
    private var rec: AudioRecord? = null
    private var audioThread: Thread? = null
    private var mic: AudioRecord? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) { stopCast(); return START_NOT_STICKY }
        val code = intent?.getIntExtra("code", 0) ?: 0
        @Suppress("DEPRECATION")
        val data: Intent? = if (Build.VERSION.SDK_INT >= 33) intent?.getParcelableExtra("data", Intent::class.java) else intent?.getParcelableExtra("data")
        val hub = ShareController.streamHub()
        if (data == null || code != Activity.RESULT_OK || hub == null) { stopSelf(); return START_NOT_STICKY }
        try {
            val wantMic = Prefs(this).castMic && androidx.core.content.ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED
            val type = if (Build.VERSION.SDK_INT >= 29) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION or (if (wantMic && Build.VERSION.SDK_INT >= 30) ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE else 0) else 0
            ServiceCompat.startForeground(this, 2, notification(), type)
            val mpm = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
            val p = mpm.getMediaProjection(code, data)
            projection = p
            val t = HandlerThread("cast").also { it.start() }
            thread = t
            val h = Handler(t.looper)
            handler = h
            p.registerCallback(object : MediaProjection.Callback() { override fun onStop() { stopCast() } }, h)
            readScreen()
            (getSystemService(Context.DISPLAY_SERVICE) as DisplayManager).registerDisplayListener(rotation, h)
            hub.start(24000, 2)
            jpegMode = false; hwFails = 0
            val b0 = battery(this)
            startPct = b0[0]; startMs = System.currentTimeMillis()
            if (Prefs(this).castCompat || !startHw(p, h, hub)) startJpeg(p, h, hub)
            startAudio(p, hub, wantMic)
            active = true
            ShareController.setOnStopStream { stopCast() }
            ShareController.refresh()
        } catch (e: Exception) {
            stopCast()
            return START_NOT_STICKY
        }
        return START_NOT_STICKY
    }

    /** The phone's real screen size right now (it changes when the phone is turned). */
    @Suppress("DEPRECATION")
    private fun readScreen() {
        val dm = android.util.DisplayMetrics()
        (getSystemService(Context.DISPLAY_SERVICE) as DisplayManager).getDisplay(0).getRealMetrics(dm)
        scrW = dm.widthPixels; scrH = dm.heightPixels; dpi = dm.densityDpi
    }

    /** Turning the phone: make the picture tall or wide again, so it fills the viewer's screen instead of staying small. */
    private val rotation = object : DisplayManager.DisplayListener {
        override fun onDisplayAdded(id: Int) {}
        override fun onDisplayRemoved(id: Int) {}
        override fun onDisplayChanged(id: Int) {
            val p = projection; val h = handler; val hub = ShareController.streamHub()
            if (id != 0 || !active || p == null || h == null || hub == null) return
            val wasWide = scrW > scrH
            readScreen()
            if ((scrW > scrH) == wasWide) return
            if (jpegMode) startJpeg(p, h, hub)
            else if (!startEncoder(p, h, hub, curShort)) encoderFailed(p, h, hub)
        }
    }

    // ---------- hardware H.264 ----------

    private var scrW = 0
    private var scrH = 0
    private var dpi = 0
    private var enc: MediaCodec? = null
    private var encSurface: Surface? = null
    private var curShort = 0
    private var baseBps = 0
    private var bps = 0
    private var lastDown = 0L
    private var lastMeasure = 0L
    private var hwFails = 0
    @Volatile private var hwFrames = 0L
    @Volatile private var hwBytes = 0L

    private fun shortSide(q: Int) = when (q) { 1 -> 480; 3 -> 1080; else -> 720 } // 0 auto and 2 both mean 720p
    private fun bitrateFor(short: Int) = when (short) { 480 -> 1_300_000; 1080 -> 6_000_000; else -> 3_000_000 }

    private fun startHw(p: MediaProjection, h: Handler, hub: StreamHub): Boolean {
        hub.expectVideo(true)
        if (!startEncoder(p, h, hub, shortSide(hub.quality()))) { hub.expectVideo(false); return false }
        h.postDelayed({
            // no picture after 5 s: this phone's encoder will not take the screen, so use JPEG
            if (active && !jpegMode && hwFrames == 0L) { stopEncoder(); startJpeg(p, h, hub) }
        }, 5000)
        lastMeasure = System.currentTimeMillis()
        h.postDelayed(adapt(p, h, hub), 3000)
        return true
    }

    /** (Re)starts the encoder at this short-side size. The screen is mirrored into its input surface, so no frame is copied by the CPU. */
    private fun startEncoder(p: MediaProjection, h: Handler, hub: StreamHub, short: Int): Boolean {
        val a = minOf(scrW, scrH); val b = maxOf(scrW, scrH)
        val s = minOf(short, a)
        val sShort = maxOf(16, s / 16 * 16)
        val sLong = maxOf(16, (b.toLong() * s / a).toInt() / 16 * 16)
        val w = if (scrW <= scrH) sShort else sLong
        val hh = if (scrW <= scrH) sLong else sShort
        val bitrate = bitrateFor(s)
        fun format(extras: Boolean): MediaFormat {
            val f = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, w, hh)
            f.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
            f.setInteger(MediaFormat.KEY_BIT_RATE, bitrate)
            f.setInteger(MediaFormat.KEY_FRAME_RATE, 30)
            f.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
            f.setLong(MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER, 150_000L) // a still screen keeps sending, so new viewers get a picture
            if (extras) {
                f.setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR)
                f.setInteger(MediaFormat.KEY_PROFILE, MediaCodecInfo.CodecProfileLevel.AVCProfileBaseline) // no B-frames, plays everywhere
                if (Build.VERSION.SDK_INT >= 29) f.setInteger(MediaFormat.KEY_MAX_B_FRAMES, 0)
            }
            return f
        }
        var e: MediaCodec? = null
        for (extras in booleanArrayOf(true, false)) {
            try {
                val c = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
                c.configure(format(extras), null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                e = c
                break
            } catch (x: Exception) { try { e?.release() } catch (y: Exception) { } }
        }
        val c = e ?: return false
        val surf: Surface
        try {
            surf = c.createInputSurface()
            c.start()
        } catch (x: Exception) { try { c.release() } catch (y: Exception) { }; return false }
        val oldEnc = enc; val oldSurf = encSurface
        enc = c; encSurface = surf
        curShort = s; baseBps = bitrate; bps = bitrate
        hwFrames = 0; hwBytes = 0
        try {
            val d = display
            if (d == null) display = p.createVirtualDisplay("localshare-cast", w, hh, dpi, DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, surf, null, h)
            else { d.surface = surf; d.resize(w, hh, dpi) }
        } catch (x: Exception) { enc = oldEnc; encSurface = oldSurf; try { c.release() } catch (y: Exception) { }; return false }
        try { oldEnc?.stop() } catch (x: Exception) { }
        try { oldEnc?.release() } catch (x: Exception) { }
        try { oldSurf?.release() } catch (x: Exception) { }
        val fm = Fmp4()
        Thread {
            val info = MediaCodec.BufferInfo()
            var sps: ByteArray? = null
            var pps: ByteArray? = null
            var announced = false
            fun params(d: ByteArray) {
                for (n in Fmp4.splitNals(d, 0, d.size)) {
                    if (n.isEmpty()) continue
                    val t = n[0].toInt() and 31
                    if (t == 7) sps = n else if (t == 8) pps = n
                }
            }
            try {
                while (enc === c) {
                    val i = c.dequeueOutputBuffer(info, 100_000)
                    if (i == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                        val f = c.outputFormat
                        for (k in arrayOf("csd-0", "csd-1")) f.getByteBuffer(k)?.let { bb -> val d = ByteArray(bb.remaining()); bb.duplicate().get(d); params(d) }
                    } else if (i >= 0) {
                        val buf = c.getOutputBuffer(i)
                        if (buf != null && info.size > 0) {
                            val d = ByteArray(info.size)
                            buf.position(info.offset); buf.limit(info.offset + info.size); buf.get(d)
                            if (info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0) params(d)
                            else {
                                val s0 = sps; val p0 = pps
                                if (!announced && s0 != null && p0 != null) {
                                    hub.setVideo(fm.init(s0, p0, w, hh), "video/mp4; codecs=\"" + Fmp4.codecString(s0) + "\"", w, hh)
                                    announced = true
                                }
                                if (announced) {
                                    val key = info.flags and MediaCodec.BUFFER_FLAG_KEY_FRAME != 0
                                    val frag = fm.fragment(d, 0, d.size, info.presentationTimeUs, key)
                                    if (frag != null) { hub.pushVideo(frag, key); hwFrames++; hwBytes += frag.size }
                                }
                            }
                        }
                        c.releaseOutputBuffer(i, false)
                    }
                }
            } catch (x: Exception) {
                if (enc === c) h.post { encoderFailed(p, h, hub) }
            }
        }.also { it.isDaemon = true; it.start() }
        return true
    }

    private fun encoderFailed(p: MediaProjection, h: Handler, hub: StreamHub) {
        if (!active || jpegMode) return
        hwFails++
        if (hwFails >= 3 || !startEncoder(p, h, hub, curShort)) { stopEncoder(); startJpeg(p, h, hub) }
    }

    private fun stopEncoder() {
        val c = enc; val s = encSurface
        enc = null; encSurface = null // cleared first: the reader thread stops when it is no longer current
        try { c?.stop() } catch (x: Exception) { }
        try { c?.release() } catch (x: Exception) { }
        try { s?.release() } catch (x: Exception) { }
    }

    /** Every 3 s: follow what viewers asked for, back off when the phone is hot or low, and ease the bitrate when a viewer's link is slow. */
    private fun adapt(p: MediaProjection, h: Handler, hub: StreamHub): Runnable = object : Runnable {
        override fun run() {
            if (!active || jpegMode) return
            val now = System.currentTimeMillis()
            val want = shortSide(hub.quality())
            val hl = health()
            val target = minOf(want, hl.cap)
            if (target != curShort) startEncoder(p, h, hub, target)
            else if (hub.pressure() > 0) {
                bps = maxOf(500_000, bps * 7 / 10); setBitrate(bps); hub.clearPressure(); lastDown = now
            } else if (bps < baseBps && now - lastDown > 15000) { bps = minOf(baseBps, bps * 11 / 10); setBitrate(bps); lastDown = now }
            val kbps = (hwBytes * 8 / maxOf(1L, now - lastMeasure)).toInt()
            hwBytes = 0; lastMeasure = now
            hub.setInfo(kbps, if (target < want) hl.note else if (bps < baseBps) "Slow link: lower bitrate" else "")
            h.postDelayed(this, 3000)
        }
    }

    private fun setBitrate(v: Int) {
        try { enc?.setParameters(Bundle().apply { putInt(MediaCodec.PARAMETER_KEY_VIDEO_BITRATE, v) }) } catch (x: Exception) { }
    }

    private class Health(val cap: Int, val note: String)

    /** The biggest picture this phone should make right now, so a long share does not cook it or flatten the battery. */
    private fun health(): Health {
        var cap = 1080; var note = ""
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        if (Build.VERSION.SDK_INT >= 29) {
            val ts = pm.currentThermalStatus
            if (ts >= PowerManager.THERMAL_STATUS_SEVERE) { cap = 480; note = "Phone is hot: 480p" }
            else if (ts >= PowerManager.THERMAL_STATUS_MODERATE) { cap = 720; note = "Phone is warm: 720p" }
        }
        val b = battery(this)
        if (b[2] >= 440 && cap > 480) { cap = 480; note = "Phone is hot: 480p" }
        if (b[1] == 0 && b[0] in 0..14) { cap = 480; note = "Battery low: 480p" }
        else if (cap > 720 && ((b[1] == 0 && b[0] in 0..29) || pm.isPowerSaveMode)) { cap = 720; note = "Saving battery: 720p" }
        return Health(cap, note)
    }

    // ---------- JPEG (compatibility) ----------

    private fun startJpeg(p: MediaProjection, h: Handler, hub: StreamHub) {
        jpegMode = true
        hub.clearVideo()
        val oldReader = reader
        val scale = minOf(1f, 1280f / maxOf(scrW, scrH))
        val w = (scrW * scale).toInt() and 1.inv()
        val hh = (scrH * scale).toInt() and 1.inv()
        val r = ImageReader.newInstance(w, hh, PixelFormat.RGBA_8888, 2)
        reader = r
        r.setOnImageAvailableListener({ rd ->
            val img = try { rd.acquireLatestImage() } catch (e: Exception) { null } ?: return@setOnImageAvailableListener
            try {
                val now = System.currentTimeMillis()
                if (now - lastAt < 100) return@setOnImageAvailableListener // about 10 frames a second is plenty
                lastAt = now
                val pl = img.planes[0]
                val rowPad = pl.rowStride - pl.pixelStride * w
                val bm = Bitmap.createBitmap(w + rowPad / pl.pixelStride, hh, Bitmap.Config.ARGB_8888)
                bm.copyPixelsFromBuffer(pl.buffer)
                val out = ByteArrayOutputStream(64 * 1024)
                (if (rowPad > 0) Bitmap.createBitmap(bm, 0, 0, w, hh) else bm).compress(Bitmap.CompressFormat.JPEG, 55, out)
                bm.recycle()
                val jpg = out.toByteArray()
                lastJpeg = jpg
                hub.pushFrame(jpg)
            } catch (e: Exception) {
            } finally { img.close() }
        }, h)
        val d = display
        if (d == null) display = p.createVirtualDisplay("localshare-cast", w, hh, dpi, DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, r.surface, null, h)
        else { d.surface = r.surface; d.resize(w, hh, dpi) }
        try { oldReader?.close() } catch (x: Exception) { }
        if (repeating) return
        repeating = true
        // a still screen produces no new frames, so repeat the last one for anyone who just opened the page
        h.postDelayed(object : Runnable {
            override fun run() {
                val j = lastJpeg
                if (active && j != null && System.currentTimeMillis() - lastAt > 900) ShareController.streamHub()?.pushFrame(j)
                if (active) h.postDelayed(this, 1000)
            }
        }, 1000)
    }

    /** Sound the phone is playing (Android 10+ and only with the microphone permission, which the system requires for this). */
    private fun startAudio(p: MediaProjection, hub: com.localshare.app.server.StreamHub, wantMic: Boolean) {
        silent = false; loudAt = System.currentTimeMillis(); startedAt = loudAt
        if (Build.VERSION.SDK_INT < 29) return
        if (androidx.core.content.ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) return
        try {
            val cfg = AudioPlaybackCaptureConfiguration.Builder(p)
                .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
                .addMatchingUsage(AudioAttributes.USAGE_GAME)
                .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
                .build()
            val fmt = AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(24000).setChannelMask(AudioFormat.CHANNEL_IN_STEREO).build()
            val min = AudioRecord.getMinBufferSize(24000, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT)
            val r = AudioRecord.Builder().setAudioPlaybackCaptureConfig(cfg).setAudioFormat(fmt).setBufferSizeInBytes(maxOf(min, 9600) * 2).build()
            if (r.state != AudioRecord.STATE_INITIALIZED) { r.release(); return }
            rec = r
            r.startRecording()
            var m: AudioRecord? = null
            if (wantMic) try { // the microphone is mono; it is mixed into both sides
                val mm = AudioRecord(android.media.MediaRecorder.AudioSource.MIC, 24000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(AudioRecord.getMinBufferSize(24000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT), 4800) * 2)
                if (mm.state == AudioRecord.STATE_INITIALIZED) { mm.startRecording(); m = mm; mic = mm } else mm.release()
            } catch (e: Exception) { m = null }
            audioThread = Thread {
                val buf = ByteArray(4800) // 50 ms of stereo
                val mb = ByteArray(2400)  // 50 ms of mono
                while (rec === r) {
                    val n = try { r.read(buf, 0, buf.size) } catch (e: Exception) { -1 }
                    if (n <= 0) break
                    if (m != null) {
                        val k = try { m.read(mb, 0, mb.size, AudioRecord.READ_NON_BLOCKING) } catch (e: Exception) { 0 }
                        var i = 0
                        while (i + 1 < k && i * 2 + 3 < n) {
                            val s = (mb[i + 1].toInt() shl 8) or (mb[i].toInt() and 255)
                            for (c in 0..1) {
                                val o = i * 2 + c * 2
                                val v = ((buf[o + 1].toInt() shl 8) or (buf[o].toInt() and 255)) + s
                                val cl = v.coerceIn(-32768, 32767)
                                buf[o] = cl.toByte(); buf[o + 1] = (cl shr 8).toByte()
                            }
                            i += 2
                        }
                    }
                    var peak = 0
                    var j = 0
                    while (j + 1 < n) { val s = Math.abs((buf[j + 1].toInt() shl 8) or (buf[j].toInt() and 255)); if (s > peak) peak = s; j += 2 }
                    val now = System.currentTimeMillis()
                    if (peak > 300) { loudAt = now; silent = false } else if (now - loudAt > 8000) silent = true
                    hub.pushAudio(if (n == buf.size) buf.copyOf() else buf.copyOf(n))
                }
            }.also { it.isDaemon = true; it.start() }
        } catch (e: Exception) { rec = null } // no sound is fine, the picture still works
    }

    private fun stopCast() {
        active = false
        stopEncoder()
        try { (getSystemService(Context.DISPLAY_SERVICE) as DisplayManager).unregisterDisplayListener(rotation) } catch (e: Exception) { }
        repeating = false
        val r = rec; rec = null
        val mi = mic; mic = null
        try { mi?.stop() } catch (e: Exception) { }
        try { mi?.release() } catch (e: Exception) { }
        try { r?.stop() } catch (e: Exception) { }
        try { r?.release() } catch (e: Exception) { }
        val d = display; val rd = reader; val p = projection; val t = thread
        display = null; reader = null; projection = null; thread = null; handler = null // cleared first: p.stop() calls back into here
        try { ShareController.streamHub()?.stop() } catch (e: Exception) { }
        try { d?.release() } catch (e: Exception) { }
        try { rd?.close() } catch (e: Exception) { }
        try { p?.stop() } catch (e: Exception) { }
        t?.quitSafely()
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
        ShareController.refresh()
    }

    override fun onDestroy() {
        if (active) stopCast()
        super.onDestroy()
    }

    private fun notification(): android.app.Notification {
        if (Build.VERSION.SDK_INT >= 26) {
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(NotificationChannel(CHANNEL, "Screen sharing", NotificationManager.IMPORTANCE_LOW))
        }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
        val stop = PendingIntent.getService(this, 2, Intent(this, CastService::class.java).setAction(ACTION_STOP), flags)
        return NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.drawable.ic_folder)
            .setContentTitle("Sharing your screen")
            .setContentText("People you let in can watch it. Tap Stop to end.")
            .setOngoing(true)
            .addAction(0, "Stop", stop)
            .build()
    }

    companion object {
        const val ACTION_STOP = "com.localshare.app.CAST_STOP"
        const val CHANNEL = "cast"
        @Volatile var active = false
        /** True while the old JPEG stream is in use (Compatibility mode, or the phone's video chip did not work). */
        @Volatile var jpegMode = false
        @Volatile var startPct = -1
        @Volatile var startMs = 0L

        /** [battery %, 1 when charging, temperature in tenths of a degree C] */
        fun battery(ctx: Context): IntArray {
            val i = ctx.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            val lv = i?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val sc = i?.getIntExtra(BatteryManager.EXTRA_SCALE, 100) ?: 100
            val st = i?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val charging = if (st == BatteryManager.BATTERY_STATUS_CHARGING || st == BatteryManager.BATTERY_STATUS_FULL) 1 else 0
            return intArrayOf(if (lv >= 0 && sc > 0) lv * 100 / sc else -1, charging, i?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0)
        }
        /** True when nothing audible was captured for a while (the app playing may block capture). */
        @Volatile var silent = false
        @Volatile var loudAt = 0L
        @Volatile var startedAt = 0L

        fun start(ctx: Context, code: Int, data: Intent) {
            androidx.core.content.ContextCompat.startForegroundService(ctx, Intent(ctx, CastService::class.java).putExtra("code", code).putExtra("data", data))
        }

        fun stop(ctx: Context) {
            if (active) ctx.startService(Intent(ctx, CastService::class.java).setAction(ACTION_STOP))
        }
    }
}
