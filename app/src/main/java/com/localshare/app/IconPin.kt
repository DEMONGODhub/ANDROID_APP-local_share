package com.localshare.app

import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Icon
import android.os.Build
import androidx.core.graphics.drawable.DrawableCompat

/**
 * Android cannot recolour the real launcher icon, so a custom icon colour is a home-screen shortcut to this app
 * with an icon drawn in that colour. @return null when Android showed its "Add to home screen" prompt, else a short message.
 */
fun pinIcon(ctx: Context, argb: Int): String? {
    if (Build.VERSION.SDK_INT < 26) return "Custom icon colours need Android 8 or newer. Use one of the ready-made colours."
    val sm = ctx.getSystemService(ShortcutManager::class.java) ?: return "This phone can't add home-screen shortcuts."
    if (!sm.isRequestPinShortcutSupported) return "Your launcher can't add shortcuts. Use one of the ready-made colours."
    return try {
        val size = 432
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val cv = Canvas(bmp)
        cv.drawColor(argb or 0xFF000000.toInt())
        val fg = ctx.getDrawable(R.drawable.ic_launcher_foreground)!!.mutate()
        val lum = (0.299 * ((argb shr 16) and 255) + 0.587 * ((argb shr 8) and 255) + 0.114 * (argb and 255)) / 255.0
        DrawableCompat.setTint(fg, if (lum > 0.5) 0xFF0C0C0D.toInt() else 0xFFFFFFFF.toInt())
        fg.setBounds(0, 0, size, size)
        fg.draw(cv)
        val info = ShortcutInfo.Builder(ctx, "icon-%06x".format(argb and 0xFFFFFF))
            .setShortLabel("LocalShare")
            .setIcon(Icon.createWithAdaptiveBitmap(bmp))
            .setIntent(Intent(ctx, MainActivity::class.java).setAction(Intent.ACTION_MAIN))
            .build()
        sm.requestPinShortcut(info, null)
        null
    } catch (e: Exception) {
        "Could not make that icon."
    }
}
