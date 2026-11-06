package com.localshare.app

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.net.Uri
import java.io.ByteArrayOutputStream

/** The host's picture: one of a few built-in logos, or a photo from the phone. Always kept as a small PNG, which guests can also see. */
object HostProfile {
    const val LOGOS = 8
    private val Y get() = com.localshare.app.ui.Accent.argb
    private const val K = 0xFF0C0C0D.toInt()

    /** Draws logo [kind] (0 is the app's own logo) into a square of side [s]. */
    fun draw(c: Canvas, kind: Int, s: Float) {
        c.save()
        c.scale(s / 120f, s / 120f)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        fun fill(color: Int) { p.style = Paint.Style.FILL; p.color = color }
        fun line(color: Int, w: Float) { p.style = Paint.Style.STROKE; p.color = color; p.strokeWidth = w; p.strokeCap = Paint.Cap.ROUND; p.strokeJoin = Paint.Join.ROUND }
        fun squircle(color: Int) { fill(color); c.drawRoundRect(RectF(0f, 0f, 120f, 120f), 30f, 30f, p) }
        fun arcs(color: Int) {
            line(color, 7f)
            c.drawArc(RectF(65f, 42f, 101f, 78f), -60f, 120f, false, p)
            c.drawArc(RectF(19f, 42f, 55f, 78f), 120f, 120f, false, p)
        }
        when (kind) {
            0, 1 -> { // the phone with signal arcs
                squircle(if (kind == 0) Y else K)
                line(if (kind == 0) K else Y, 7f)
                c.drawRoundRect(RectF(39f, 22f, 81f, 98f), 10f, 10f, p)
                arcs(if (kind == 0) K else Y)
            }
            2 -> { // folder that broadcasts
                squircle(K)
                c.save(); c.scale(.8f, .8f, 60f, 60f)
                val f = Path().apply {
                    moveTo(18f, 46f); quadTo(18f, 40f, 24f, 40f); lineTo(48f, 40f); lineTo(58f, 52f); lineTo(102f, 52f)
                    quadTo(110f, 52f, 110f, 60f); lineTo(110f, 96f); quadTo(110f, 104f, 102f, 104f); lineTo(26f, 104f)
                    quadTo(18f, 104f, 18f, 96f); close()
                }
                fill(Y); c.drawPath(f, p)
                fill(K); c.drawCircle(60f, 86f, 6f, p)
                line(K, 6f)
                c.drawArc(RectF(40f, 70.3f, 80f, 110.3f), -134f, 88f, false, p)
                c.drawArc(RectF(28f, 59.2f, 92f, 123.2f), -133.5f, 87f, false, p)
                c.restore()
            }
            3 -> { // orbit
                squircle(K)
                line(Y, 9f); c.drawCircle(60f, 60f, 34f, p)
                fill(Y); c.drawCircle(60f, 60f, 15f, p); c.drawCircle(88f, 32f, 8f, p)
            }
            4 -> { // L with signal
                squircle(Y)
                line(K, 14f)
                c.drawPath(Path().apply { moveTo(38f, 30f); lineTo(38f, 82f); lineTo(68f, 82f) }, p)
                fill(K); c.drawCircle(78f, 40f, 7f, p)
                line(K, 6f)
                c.drawArc(RectF(62f, 24f, 94f, 56f), -90f, 90f, false, p)
                c.drawArc(RectF(50f, 12f, 106f, 68f), -90f, 90f, false, p)
            }
            5 -> { // bolt
                squircle(K)
                fill(Y)
                c.drawPath(Path().apply { moveTo(68f, 14f); lineTo(34f, 66f); lineTo(55f, 66f); lineTo(48f, 106f); lineTo(86f, 50f); lineTo(63f, 50f); close() }, p)
            }
            6 -> { // play
                fill(Y); c.drawCircle(60f, 60f, 60f, p)
                fill(K)
                c.drawPath(Path().apply { moveTo(46f, 34f); lineTo(46f, 86f); lineTo(88f, 60f); close() }, p)
            }
            else -> { // star
                squircle(K)
                fill(Y)
                val st = Path()
                for (i in 0 until 10) {
                    val r = if (i % 2 == 0) 40.0 else 17.0
                    val a = Math.toRadians(-90.0 + i * 36.0)
                    val x = (60 + r * Math.cos(a)).toFloat(); val y = (62 + r * Math.sin(a)).toFloat()
                    if (i == 0) st.moveTo(x, y) else st.lineTo(x, y)
                }
                st.close(); c.drawPath(st, p)
            }
        }
        c.restore()
    }

    fun logoBitmap(kind: Int, px: Int = 160): Bitmap {
        val b = Bitmap.createBitmap(px, px, Bitmap.Config.ARGB_8888)
        draw(Canvas(b), kind, px.toFloat())
        return b
    }

    fun png(b: Bitmap): ByteArray {
        val o = ByteArrayOutputStream()
        b.compress(Bitmap.CompressFormat.PNG, 100, o)
        return o.toByteArray()
    }

    /** A photo from the phone, cut to a square and shrunk so it stays small. Null when it cannot be read. */
    fun photoBitmap(ctx: Context, uri: Uri, px: Int = 160): Bitmap? = try {
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, o) }
        var ss = 1
        while (o.outWidth / ss / 2 >= px * 2 && o.outHeight / ss / 2 >= px * 2) ss *= 2
        val src = ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = ss }) }
        if (src == null) null else {
            val side = minOf(src.width, src.height)
            val sq = Bitmap.createBitmap(src, (src.width - side) / 2, (src.height - side) / 2, side, side)
            Bitmap.createScaledBitmap(sq, px, px, true)
        }
    } catch (e: Exception) { null }
}
