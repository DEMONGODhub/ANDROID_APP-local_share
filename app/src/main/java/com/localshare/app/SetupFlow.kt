package com.localshare.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect

private enum class Step { Welcome, Notify, Battery, Brand, Go }

private fun notifOk(ctx: Context) = Build.VERSION.SDK_INT < 33 ||
    ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

private fun batteryOk(ctx: Context) = Build.VERSION.SDK_INT < 23 ||
    (ctx.getSystemService(Context.POWER_SERVICE) as PowerManager).isIgnoringBatteryOptimizations(ctx.packageName)

/** 1 = first launch (full tour), 2 = already seen but a needed setting is off, 0 = nothing to show. */
fun setupMode(ctx: Context): Int = when {
    !ShareController.guideSeen() -> 1
    !notifOk(ctx) || !batteryOk(ctx) -> 2
    else -> 0
}

/** The set-up tour: one card per step with a progress bar, shown on first launch and again while a needed setting is off. */
@Composable
fun SetupFlow(mode: Int, onDone: () -> Unit) {
    val ctx = LocalContext.current
    val steps = remember {
        buildList {
            if (mode == 1) add(Step.Welcome)
            if (Build.VERSION.SDK_INT >= 33 && (mode == 1 || !notifOk(ctx))) add(Step.Notify)
            if (Build.VERSION.SDK_INT >= 23 && (mode == 1 || !batteryOk(ctx))) add(Step.Battery)
            if (mode == 1) { add(Step.Brand); add(Step.Go) }
        }
    }
    if (steps.isEmpty()) { onDone(); return }
    var i by remember { mutableStateOf(0) }
    var notif by remember { mutableStateOf(notifOk(ctx)) }
    var battery by remember { mutableStateOf(batteryOk(ctx)) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { notif = notifOk(ctx); battery = batteryOk(ctx) }
    val ask = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { notif = notifOk(ctx) }
    val step = steps[i]
    val last = i == steps.lastIndex
    fun next() { if (last) onDone() else i++ }

    Dialog(onDismissRequest = {}, properties = DialogProperties(usePlatformDefaultWidth = false, dismissOnBackPress = false, dismissOnClickOutside = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.fillMaxSize().padding(24.dp)) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Row(Modifier.weight(1f).semantics { contentDescription = "Step ${i + 1} of ${steps.size}" }, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        steps.indices.forEach { k ->
                            Box(Modifier.size(width = if (k == i) 28.dp else 10.dp, height = 10.dp).clip(CircleShape)
                                .background(if (k <= i) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline))
                        }
                    }
                    TextButton(onDone, Modifier.heightIn(min = 48.dp)) { Text("Skip") }
                }
                Column(Modifier.weight(1f).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    val (icon, title, body) = when (step) {
                        Step.Welcome -> Triple("📡", "Share your phone's folders", "LocalShare turns a folder on this phone into a website anyone on your Wi-Fi or hotspot can open. No internet and no account. Let's set it up in a few taps.")
                        Step.Notify -> Triple("🔔", "Allow the small notice", "Android needs a notice in the status bar to let sharing keep running while the screen is off. You can stop sharing from it.")
                        Step.Battery -> Triple("🔋", "Keep sharing alive", "Without this, Android can put LocalShare to sleep a few minutes after you lock the phone. Tap Allow, then choose Allow in the box that opens.")
                        Step.Brand -> Triple("⚙️", "One more switch on some phones", "Xiaomi, Oppo, Vivo, Realme and Samsung phones have an “Autostart” or “Battery” switch in the app's settings. Open it and turn it on so sharing is not stopped by itself.")
                        Step.Go -> Triple("🚀", "You're ready", "1. Tap Add a folder and pick one.\n2. Tap Start sharing.\n3. On another device on the same Wi-Fi, scan the QR code or type the address.")
                    }
                    Text(icon, fontSize = 64.sp)
                    Spacer(Modifier.size(16.dp))
                    Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Spacer(Modifier.size(10.dp))
                    Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                    val done = (step == Step.Notify && notif) || (step == Step.Battery && battery)
                    if (done) {
                        Spacer(Modifier.size(12.dp))
                        Text("✓ Done", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                }
                val done = (step == Step.Notify && notif) || (step == Step.Battery && battery)
                Button(
                    {
                        when {
                            step == Step.Notify && !notif -> ask.launch(Manifest.permission.POST_NOTIFICATIONS)
                            step == Step.Battery && !battery -> requestUnrestricted(ctx)
                            step == Step.Brand -> {
                                try { ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}"))) } catch (e: Exception) { }
                                next()
                            }
                            else -> next()
                        }
                    },
                    Modifier.fillMaxWidth().heightIn(min = 52.dp),
                ) {
                    Text(
                        when {
                            step == Step.Welcome -> "Start"
                            step == Step.Notify && !done -> "Allow notice"
                            step == Step.Battery && !done -> "Allow"
                            step == Step.Brand -> "Open app settings"
                            last -> "Finish"
                            else -> "Next"
                        },
                    )
                }
                if ((step == Step.Notify || step == Step.Battery || step == Step.Brand) && !done) TextButton({ next() }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Text(if (step == Step.Brand) "Skip this" else "Not now") }
            }
        }
    }
}
