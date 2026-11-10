package com.localshare.app.ui

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** The host's accent colour (yellow unless changed in Settings). Everything that was yellow follows it. */
object Accent {
    const val DEFAULT = 0xFFFFD60A.toInt()
    var argb by mutableIntStateOf(DEFAULT)
}

/** Black or white text, whichever reads better on [c]. */
fun onAccent(c: Color): Color = if (c.luminance() > 0.5f) Color.Black else Color.White

// Onyx plus one accent colour. The web page uses the same family (assets/web/index.html).
private fun dark(a: Color) = darkColorScheme(
    primary = a, onPrimary = onAccent(a),
    primaryContainer = lerp(Color(0xFF111113), a, 0.2f), onPrimaryContainer = lerp(a, Color.White, 0.5f),
    secondary = a, onSecondary = onAccent(a),
    background = Color(0xFF0C0C0D), onBackground = Color(0xFFF2F2F0),
    surface = Color(0xFF111113), onSurface = Color(0xFFF2F2F0),
    surfaceVariant = Color(0xFF1E1E21), onSurfaceVariant = Color(0xFF9B9BA2),
    surfaceContainerLowest = Color(0xFF0C0C0D), surfaceContainerLow = Color(0xFF111113),
    surfaceContainer = Color(0xFF19191B), surfaceContainerHigh = Color(0xFF222225), surfaceContainerHighest = Color(0xFF2C2C30),
    outline = Color(0xFF38383D), outlineVariant = Color(0xFF2A2A2E),
    error = Color(0xFFF0745F), onError = Color(0xFF2A0A05),
)

private val Type = Typography(
    headlineMedium = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 30.sp, lineHeight = 36.sp, letterSpacing = (-0.6).sp),
    titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 28.sp, letterSpacing = (-0.2).sp),
    titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 17.sp, lineHeight = 24.sp),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 21.sp),
    bodySmall = TextStyle(fontSize = 12.5.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 14.sp, letterSpacing = 0.2.sp),
)

@Composable
fun LocalShareTheme(content: @Composable () -> Unit) {
    // a new accent colour fades in over a third of a second instead of snapping
    val acc by androidx.compose.animation.animateColorAsState(Color(Accent.argb), androidx.compose.animation.core.tween(320), label = "accent")
    MaterialTheme(
        colorScheme = remember(acc) { dark(acc) },
        typography = Type,
        shapes = Shapes(
            small = RoundedCornerShape(14.dp),
            medium = RoundedCornerShape(20.dp),
            large = RoundedCornerShape(28.dp),
            extraLarge = RoundedCornerShape(34.dp),
        ),
        content = content,
    )
}
