package com.localshare.app

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.localshare.app.ui.Accent
import com.localshare.app.ui.LogoMark
import com.localshare.app.ui.SectionCard
import com.localshare.app.ui.onAccent

private val PRESETS = listOf(
    "Yellow" to 0xFFFFD60A, "White" to 0xFFFFFFFF, "Silver" to 0xFFC0C0C8,
    "Purple" to 0xFFA855F7, "Blue" to 0xFF3B82F6, "Cyan" to 0xFF22D3EE,
    "Green" to 0xFF22C55E, "Mint" to 0xFF34D399, "Lime" to 0xFFA3E635,
).map { (n, v) -> n to Color(v) }

private fun hexOf(c: Color) = "#%06X".format(c.toArgb() and 0xFFFFFF)

/** Settings card: pick the colour that replaces yellow everywhere (not the files, not the stream). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun AccentCard() {
    val cur = Color(Accent.argb)
    var h by remember(cur) { mutableFloatStateOf(FloatArray(3).also { android.graphics.Color.colorToHSV(cur.toArgb(), it) }[0]) }
    var s by remember(cur) { mutableFloatStateOf(FloatArray(3).also { android.graphics.Color.colorToHSV(cur.toArgb(), it) }[1]) }
    var v by remember(cur) { mutableFloatStateOf(FloatArray(3).also { android.graphics.Color.colorToHSV(cur.toArgb(), it) }[2]) }
    var hex by remember(cur) { mutableStateOf(hexOf(cur)) }
    val draft = Color.hsv(h, s, v)
    fun picked(hh: Float = h, ss: Float = s, vv: Float = v) { h = hh; s = ss; v = vv; hex = hexOf(Color.hsv(hh, ss, vv)) }

    SectionCard {
        Text("Accent colour", fontWeight = FontWeight.SemiBold)
        Text("Replaces yellow in the app, the logo and the guests' page. Your files and the live stream keep their own colours.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PRESETS.forEach { (name, c) ->
                val on = c.toArgb() == cur.toArgb()
                Box(
                    Modifier.size(44.dp).clip(CircleShape).background(c)
                        .border(if (on) 3.dp else 1.dp, if (on) MaterialTheme.colorScheme.onBackground else MaterialTheme.colorScheme.outline, CircleShape)
                        .clickable { ShareController.setAccent(c.toArgb()) }
                        .semantics { contentDescription = name + if (on) ", selected" else "" },
                )
            }
        }
        Text("Custom colour", fontWeight = FontWeight.SemiBold)
        Box(
            Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(14.dp))
                .pointerInput(Unit) { detectTapGestures { o -> picked(ss = (o.x / size.width).coerceIn(0f, 1f), vv = 1f - (o.y / size.height).coerceIn(0f, 1f)) } }
                .pointerInput(Unit) {
                    detectDragGestures { c, _ -> picked(ss = (c.position.x / size.width).coerceIn(0f, 1f), vv = 1f - (c.position.y / size.height).coerceIn(0f, 1f)) }
                }
                .semantics { contentDescription = "Colour square: left to right is paler to stronger, top to bottom is brighter to darker" },
        ) {
            Canvas(Modifier.matchParentSize()) {
                drawRect(Brush.horizontalGradient(listOf(Color.White, Color.hsv(h, 1f, 1f))))
                drawRect(Brush.verticalGradient(listOf(Color.Transparent, Color.Black)))
                val p = Offset(s * size.width, (1f - v) * size.height)
                drawCircle(Color.Black, 11.dp.toPx(), p)
                drawCircle(Color.White, 9.dp.toPx(), p, style = androidx.compose.ui.graphics.drawscope.Stroke(3.dp.toPx()))
            }
        }
        Box(
            Modifier.fillMaxWidth().height(28.dp).clip(RoundedCornerShape(14.dp))
                .pointerInput(Unit) { detectTapGestures { o -> picked(hh = (o.x / size.width).coerceIn(0f, 1f) * 360f) } }
                .pointerInput(Unit) { detectDragGestures { c, _ -> picked(hh = (c.position.x / size.width).coerceIn(0f, 1f) * 360f) } }
                .semantics { contentDescription = "Hue bar" },
        ) {
            Canvas(Modifier.matchParentSize()) {
                drawRect(Brush.horizontalGradient((0..6).map { Color.hsv(it * 60f, 1f, 1f) }))
                val x = (h / 360f) * size.width
                drawCircle(Color.White, 11.dp.toPx(), Offset(x, size.height / 2), style = androidx.compose.ui.graphics.drawscope.Stroke(3.dp.toPx()))
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(draft), contentAlignment = Alignment.Center) {
                LogoMark(28.dp, onAccent(draft), false)
            }
            OutlinedTextField(
                hex, { t ->
                    hex = t.take(7)
                    if (Regex("#[0-9A-Fa-f]{6}").matches(hex)) {
                        val a = FloatArray(3); android.graphics.Color.colorToHSV(android.graphics.Color.parseColor(hex), a)
                        h = a[0]; s = a[1]; v = a[2]
                    }
                },
                singleLine = true, modifier = Modifier.weight(1f), label = { Text("Hex code, like #A855F7") },
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.align(Alignment.End)) {
            OutlinedButton({ ShareController.setAccent(Accent.DEFAULT) }, Modifier.heightIn(min = 48.dp)) { Text("Reset") }
            Button({ ShareController.setAccent(draft.toArgb()) }, Modifier.heightIn(min = 48.dp), enabled = draft.toArgb() != cur.toArgb()) { Text("Apply") }
        }
    }
}
