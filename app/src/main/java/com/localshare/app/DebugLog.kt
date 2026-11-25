package com.localshare.app

import android.content.Context
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** A small on-phone log: crashes are written here, and Settings can copy it so a bug report needs no computer. Nothing leaves the phone. */
object DebugLog {
    private const val MAX = 64 * 1024
    private var file: File? = null

    fun install(ctx: Context) {
        if (file != null) return
        file = File(ctx.applicationContext.filesDir, "debug.log")
        val old = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { t, e ->
            try { add("CRASH in ${t.name}\n" + android.util.Log.getStackTraceString(e)) } catch (x: Throwable) { }
            old?.uncaughtException(t, e)
        }
        add("start v" + try { ctx.packageManager.getPackageInfo(ctx.packageName, 0).versionName } catch (x: Exception) { "?" } + " android " + android.os.Build.VERSION.SDK_INT + " " + android.os.Build.MODEL)
    }

    @Synchronized fun add(msg: String) {
        val f = file ?: return
        try {
            val line = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date()) + "  " + msg + "\n"
            var keep = if (f.exists()) f.readText() else ""
            if (keep.length + line.length > MAX) keep = keep.takeLast(MAX / 2)
            f.writeText(keep + line)
        } catch (e: Exception) { }
    }

    fun read(): String = try { file?.takeIf { it.exists() }?.readText() ?: "" } catch (e: Exception) { "" }
    @Synchronized fun clear() { try { file?.delete() } catch (e: Exception) { } }
}
