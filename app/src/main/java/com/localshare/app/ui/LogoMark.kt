package com.localshare.app.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp

/** The LocalShare mark: a phone with a signal arc on each side. While [live] the arcs pulse outward, one after the other. */
@Composable
fun LogoMark(size: Dp, color: Color, live: Boolean, modifier: Modifier = Modifier) {
    val t = rememberInfiniteTransition(label = "logo")
    val a by t.animateFloat(0.25f, 1f, infiniteRepeatable(tween(1200, easing = LinearEasing), RepeatMode.Reverse), label = "r")
    val b by t.animateFloat(0.25f, 1f, infiniteRepeatable(tween(1200, delayMillis = 250, easing = LinearEasing), RepeatMode.Reverse), label = "l")
    Canvas(modifier.size(size)) {
        val u = this.size.minDimension / 96f // drawn on a 80 x 96 grid
        fun x(v: Float) = (v - 20f) * u + (this.size.width - 80f * u) / 2f
        fun y(v: Float) = (v - 12f) * u
        val w = 7f * u
        val st = Stroke(w, cap = StrokeCap.Round)
        drawRoundRect(color, Offset(x(39f), y(22f)), Size(42f * u, 76f * u), CornerRadius(10f * u), style = st)
        fun arc(cx: Float, left: Boolean, alpha: Float) = drawArc(
            color.copy(alpha = if (live) alpha else 1f), if (left) 120f else -60f, if (left) 120f else 120f, false,
            Offset(x(cx) - 18f * u, y(60f) - 18f * u), Size(36f * u, 36f * u), style = st,
        )
        arc(83f, false, a)
        arc(37f, true, b)
    }
}
