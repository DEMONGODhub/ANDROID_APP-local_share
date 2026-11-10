package com.localshare.app.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.material3.ButtonColors
import androidx.compose.material3.ButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import kotlinx.coroutines.launch

/**
 * Shrinks a little while pressed and springs back with a small bounce, so every touch feels answered.
 * It only watches touches and never consumes them, so the clicks underneath work exactly as before.
 */
fun Modifier.pressFeel(haptic: Boolean = false): Modifier = composed {
    val scale = remember { Animatable(1f) }
    val scope = rememberCoroutineScope()
    val h = LocalHapticFeedback.current
    this
        .graphicsLayer { scaleX = scale.value; scaleY = scale.value }
        .pointerInput(Unit) {
            awaitEachGesture {
                val down = awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
                if (haptic) h.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                scope.launch { scale.animateTo(0.95f, spring(stiffness = Spring.StiffnessHigh)) }
                var holding = true
                while (holding) { // lets go when the finger lifts or drags away (a scroll), so nothing stays shrunk
                    val e = awaitPointerEvent(PointerEventPass.Initial)
                    holding = e.changes.any { it.pressed } && e.changes.all { (it.position - down.position).getDistance() < 48f }
                }
                scope.launch { scale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)) }
            }
        }
}

private fun tick(h: HapticFeedback, onClick: () -> Unit): () -> Unit = {
    h.performHapticFeedback(HapticFeedbackType.TextHandleMove)
    onClick()
}

// Drop-in versions of the Material buttons: same look, plus the press spring and a light tick.
@Composable
fun Button(
    onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, shape: Shape = ButtonDefaults.shape,
    colors: ButtonColors = ButtonDefaults.buttonColors(), contentPadding: PaddingValues = ButtonDefaults.ContentPadding,
    content: @Composable RowScope.() -> Unit,
) = androidx.compose.material3.Button(tick(LocalHapticFeedback.current, onClick), modifier.pressFeel(), enabled, shape, colors, contentPadding = contentPadding, content = content)

@Composable
fun OutlinedButton(
    onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, shape: Shape = ButtonDefaults.outlinedShape,
    colors: ButtonColors = ButtonDefaults.outlinedButtonColors(), border: BorderStroke? = ButtonDefaults.outlinedButtonBorder(enabled),
    contentPadding: PaddingValues = ButtonDefaults.ContentPadding, content: @Composable RowScope.() -> Unit,
) = androidx.compose.material3.OutlinedButton(tick(LocalHapticFeedback.current, onClick), modifier.pressFeel(), enabled, shape, colors, border = border, contentPadding = contentPadding, content = content)

@Composable
fun TextButton(
    onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, shape: Shape = ButtonDefaults.textShape,
    colors: ButtonColors = ButtonDefaults.textButtonColors(), contentPadding: PaddingValues = ButtonDefaults.TextButtonContentPadding,
    content: @Composable RowScope.() -> Unit,
) = androidx.compose.material3.TextButton(tick(LocalHapticFeedback.current, onClick), modifier.pressFeel(), enabled, shape, colors, contentPadding = contentPadding, content = content)
