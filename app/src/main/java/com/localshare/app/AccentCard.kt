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
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.TextButton
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

private val ICONS = listOf(
    "Yellow" to Color(0xFFFFD60A), "White" to Color(0xFFFFFFFF), "Purple" to Color(0xFFA855F7),
    "Blue" to Color(0xFF3B82F6), "Silver" to Color(0xFFC0C0C8), "Green" to Color(0xFF22C55E),
)

private fun alias(ctx: android.content.Context, n: String) = android.content.ComponentName(ctx, "com.localshare.app.Icon$n")

private fun iconNow(ctx: android.content.Context): String =
    ICONS.firstOrNull { ctx.packageManager.getComponentEnabledSetting(alias(ctx, it.first)) == android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_ENABLED }?.first ?: "Yellow"

/** Enables the chosen launcher alias first, then disables the others, so the app never vanishes from the home screen. */
internal fun setIcon(ctx: android.content.Context, name: String) {
    val pm = ctx.packageManager
    pm.setComponentEnabledSetting(alias(ctx, name), android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_ENABLED, android.content.pm.PackageManager.DONT_KILL_APP)
    ICONS.forEach { if (it.first != name) pm.setComponentEnabledSetting(alias(ctx, it.first), android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_DISABLED, android.content.pm.PackageManager.DONT_KILL_APP) }
}

internal fun hexOf(c: Color) = "#%06X".format(c.toArgb() and 0xFFFFFF)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Hint(t: String) = Text(t, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)

/** The Appearance tab: pick the colour that replaces yellow (app, logo, guests' page, games) and the home-screen icon colour. */
@OptIn(ExperimentalLayoutApi::class, ExperimentalFoundationApi::class)
@Composable
internal fun AppearanceCard() {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val cur = Color(Accent.argb)
    var saved by remember { mutableStateOf(ShareController.savedColors(false)) }
    var savedIcons by remember { mutableStateOf(ShareController.savedColors(true)) }
    var icon by remember { mutableStateOf(iconNow(ctx)) }
    var adding by remember { mutableStateOf(0) } // 1 = new accent colour, 2 = new icon colour
    var note by remember { mutableStateOf("") }
    fun parse(h: String) = Color(android.graphics.Color.parseColor(h))

    SectionCard {
        Text("Accent colour", fontWeight = FontWeight.SemiBold)
        Hint("Replaces yellow in the app, the logo, the guests' page and the games. Your files and the live stream keep their own colours.")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PRESETS.forEach { (name, c) -> Swatch(c, CircleShape, c.toArgb() == cur.toArgb(), name) { ShareController.setAccent(c.toArgb()) } }
            saved.forEach { h ->
                val c = parse(h)
                Swatch(c, CircleShape, c.toArgb() == cur.toArgb(), "Saved colour $h. Long press to remove", onLong = { ShareController.forgetColor(false, h); saved = ShareController.savedColors(false) }) { ShareController.setAccent(c.toArgb()) }
            }
            PlusTile(CircleShape, "Add a colour") { adding = 1 }
        }
        if (saved.isNotEmpty()) Hint("Long press a saved colour to remove it.")
        Text("Reset to yellow", color = MaterialTheme.colorScheme.primary, modifier = Modifier.clickable { ShareController.setAccent(Accent.DEFAULT) }.heightIn(min = 40.dp).padding(top = 8.dp))
    }
    SectionCard {
        Text("Home-screen icon", fontWeight = FontWeight.SemiBold)
        Hint("Pick one of the ready-made icon colours. Your home screen may take a few seconds to update.")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            ICONS.forEach { (name, c) ->
                Swatch(c, RoundedCornerShape(14.dp), name == icon, "$name icon", logo = true) { setIcon(ctx, name); icon = name }
            }
        }
        Text("Your own icon colours", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 6.dp))
        Hint("Tap + to make an icon in any colour. Android asks you to add it to the home screen. The original icon stays and you can remove either one.")
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            savedIcons.forEach { h ->
                val c = parse(h)
                Swatch(c, RoundedCornerShape(14.dp), false, "Icon colour $h. Tap to add to the home screen, long press to remove", logo = true,
                    onLong = { ShareController.forgetColor(true, h); savedIcons = ShareController.savedColors(true) }) { note = pinIcon(ctx, c.toArgb()) ?: "" }
            }
            PlusTile(RoundedCornerShape(14.dp), "Add an icon colour") { adding = 2 }
        }
        if (note.isNotEmpty()) Hint(note)
    }
    if (adding != 0) ColorPickerDialog(
        initial = if (adding == 1) cur else Color(0xFFA855F7),
        title = if (adding == 1) "New accent colour" else "New icon colour",
        confirm = if (adding == 1) "Save and use" else "Save and add icon",
        onDismiss = { adding = 0 },
    ) { c ->
        val hx = hexOf(c)
        if (adding == 1) { ShareController.saveColor(false, hx); saved = ShareController.savedColors(false); ShareController.setAccent(c.toArgb()) }
        else { ShareController.saveColor(true, hx); savedIcons = ShareController.savedColors(true); note = pinIcon(ctx, c.toArgb()) ?: "" }
        adding = 0
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun Swatch(c: Color, shape: androidx.compose.ui.graphics.Shape, on: Boolean, label: String, logo: Boolean = false, onLong: (() -> Unit)? = null, onClick: () -> Unit) {
    Box(
        Modifier.size(44.dp).clip(shape).background(c)
            .border(if (on) 3.dp else 1.dp, if (on) MaterialTheme.colorScheme.onBackground else MaterialTheme.colorScheme.outline, shape)
            .combinedClickable(onLongClick = onLong, onClick = onClick)
            .semantics { contentDescription = label + if (on) ", selected" else "" },
        contentAlignment = Alignment.Center,
    ) { if (logo) LogoMark(26.dp, onAccent(c), false) }
}

@Composable
private fun PlusTile(shape: androidx.compose.ui.graphics.Shape, label: String, onClick: () -> Unit) {
    Box(
        Modifier.size(44.dp).clip(shape).border(1.5.dp, MaterialTheme.colorScheme.primary, shape).clickable(onClick = onClick).semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) { Icon(Icons.Filled.Add, null, tint = MaterialTheme.colorScheme.primary) }
}

/** A colour square, a hue bar and a hex box with a live preview. */
@Composable
private fun ColorPickerDialog(initial: Color, title: String, confirm: String, onDismiss: () -> Unit, onConfirm: (Color) -> Unit) {
    val hsv = remember(initial) { FloatArray(3).also { android.graphics.Color.colorToHSV(initial.toArgb(), it) } }
    var h by remember(initial) { mutableFloatStateOf(hsv[0]) }
    var s by remember(initial) { mutableFloatStateOf(hsv[1]) }
    var v by remember(initial) { mutableFloatStateOf(hsv[2]) }
    var hex by remember(initial) { mutableStateOf(hexOf(initial)) }
    val draft = Color.hsv(h, s, v)
    fun picked(hh: Float = h, ss: Float = s, vv: Float = v) { h = hh; s = ss; v = vv; hex = hexOf(Color.hsv(hh, ss, vv)) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(14.dp))
                        .pointerInput(Unit) { detectTapGestures { o -> picked(ss = (o.x / size.width).coerceIn(0f, 1f), vv = 1f - (o.y / size.height).coerceIn(0f, 1f)) } }
                        .pointerInput(Unit) { detectDragGestures { c, _ -> picked(ss = (c.position.x / size.width).coerceIn(0f, 1f), vv = 1f - (c.position.y / size.height).coerceIn(0f, 1f)) } }
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
                        drawCircle(Color.White, 11.dp.toPx(), Offset((h / 360f) * size.width, size.height / 2), style = androidx.compose.ui.graphics.drawscope.Stroke(3.dp.toPx()))
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(draft), contentAlignment = Alignment.Center) { LogoMark(28.dp, onAccent(draft), false) }
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
            }
        },
        confirmButton = { TextButton({ onConfirm(draft) }, Modifier.heightIn(min = 48.dp)) { Text(confirm) } },
        dismissButton = { TextButton(onDismiss, Modifier.heightIn(min = 48.dp)) { Text("Cancel") } },
    )
}
