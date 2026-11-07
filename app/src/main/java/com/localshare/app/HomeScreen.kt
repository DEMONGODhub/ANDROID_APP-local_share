package com.localshare.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.filled.MoreVert
import kotlinx.coroutines.launch
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.*
import androidx.compose.ui.semantics.Role
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import com.localshare.app.ui.QrCode
import com.localshare.app.ui.SectionCard
import com.localshare.app.ui.StorageRing

/** Asks Android, with one tap, to stop limiting this app's battery use so sharing survives the screen turning off. */
@android.annotation.SuppressLint("BatteryLife")
private fun requestUnrestricted(ctx: android.content.Context) {
    try {
        ctx.startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${ctx.packageName}")))
    } catch (e: Exception) {
        try { ctx.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)) }
        catch (e2: Exception) { ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}"))) }
    }
}

private data class Perms(val notifications: Boolean, val unrestricted: Boolean)

private fun readPerms(ctx: android.content.Context): Perms {
    val notif = Build.VERSION.SDK_INT < 33 ||
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    val pm = ctx.getSystemService(android.content.Context.POWER_SERVICE) as PowerManager
    val battery = Build.VERSION.SDK_INT < 23 || pm.isIgnoringBatteryOptimizations(ctx.packageName)
    return Perms(notif, battery)
}

@Composable
fun HomeScreen(st: UiState, openBrowser: () -> Unit, onCast: () -> Unit, onJoin: (String) -> Unit) {
    val ctx = LocalContext.current
    val clip = LocalClipboardManager.current
    var perms by remember { mutableStateOf(readPerms(ctx)) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { perms = readPerms(ctx) }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
        if (uri != null) {
            ctx.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            ShareController.addFolder(uri)
        }
    }
    val notif = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { perms = readPerms(ctx) }
    var showDonate by remember { mutableStateOf(false) }
    var tvNote by remember { mutableStateOf<String?>(null) }
    var confirmStop by remember { mutableStateOf(false) }
    if (confirmStop) AlertDialog(
        onDismissRequest = { confirmStop = false },
        title = { Text("Stop sharing?") },
        text = { Text("${st.devices.size} connected ${if (st.devices.size == 1) "device" else "devices"} will be disconnected, and any game in progress ends.") },
        confirmButton = { TextButton({ confirmStop = false; ShareService.stop(ctx) }) { Text("Stop sharing") } },
        dismissButton = { TextButton({ confirmStop = false }) { Text("Keep sharing") } },
    )
    if (showDonate) DonateDialog { showDonate = false }

    fun start() {
        if (Build.VERSION.SDK_INT >= 33 && !perms.notifications) notif.launch(Manifest.permission.POST_NOTIFICATIONS)
        ShareService.start(ctx)
        // only ask while the exemption is off, and not again for 3 days after the person has seen the box
        if (Build.VERSION.SDK_INT >= 23 && !readPerms(ctx).unrestricted) {
            val sp = ctx.getSharedPreferences("battery_ask", android.content.Context.MODE_PRIVATE)
            val now = System.currentTimeMillis()
            if (now - sp.getLong("at", 0L) > 3L * 24 * 3600 * 1000) {
                sp.edit().putLong("at", now).apply()
                requestUnrestricted(ctx)
            }
        }
    }

    LaunchedEffect(Unit) { ShareController.measure() }
    val ls = rememberLazyListState()
    var sec by rememberSaveable { mutableStateOf(0) } // 0 all, 1 sharing, 2 folders, 3 access, 4 support, 5 chat
    var showProfile by remember { mutableStateOf(false) }
    if (showProfile) ProfileDialog(st) { showProfile = false }
    var seenChat by remember { mutableStateOf<ChatRow?>(null) }
    val lastChat = st.chat.lastOrNull()
    LaunchedEffect(sec, lastChat) { if (sec == 5) seenChat = lastChat }
    LaunchedEffect(sec) { ls.scrollToItem(0) }
    val copy: (String) -> Unit = { u: String -> clip.setText(AnnotatedString(u)); android.widget.Toast.makeText(ctx, "Link copied", android.widget.Toast.LENGTH_SHORT).show() }
    val stop: () -> Unit = { if (st.devices.isEmpty()) ShareService.stop(ctx) else confirmStop = true }
    Row(Modifier.fillMaxSize().statusBarsPadding()) {
        HomeRail(
            st, sec, lastChat != null && lastChat != seenChat && sec != 5, { sec = it },
            { if (st.running) stop() else start() },
            {
                if (!st.running) android.widget.Toast.makeText(ctx, "Start sharing first", android.widget.Toast.LENGTH_SHORT).show()
                else if (st.casting) CastService.stop(ctx) else onCast()
            },
        )
        Column(Modifier.weight(1f).fillMaxHeight().clip(RoundedCornerShape(topStart = 24.dp)).background(MaterialTheme.colorScheme.background)) {
            SectionHeader(sec, st)
            LazyColumn(
                Modifier.weight(1f), state = ls,
                contentPadding = PaddingValues(start = 12.dp, end = 12.dp, bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                if (sec == 0 || sec == 1) item(key = "status") { StatusCard(st, ::start, stop, copy) }
                if (sec == 0 || sec == 2) item(key = "storage") { StorageCard(st) }
                if (sec == 0 || sec == 2) item(key = "folders") { FoldersCard(st, { picker.launch(null) }) }
                if (sec == 0 || sec == 1) item(key = "screen") { ScreenCard(st, onCast) }
                if (sec == 0 || sec == 3) item(key = "invite") { InviteCard(st) }
                if ((sec == 0 || sec == 5) && st.running) item(key = "chat") { ChatCard(st) }
                if (sec == 5 && !st.running) item(key = "nochat") {
                    SectionCard {
                        Text("Start sharing to use live chat", fontWeight = FontWeight.SemiBold)
                        Text("Guests chat from the web page and you answer here.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                        Button(::start, Modifier.fillMaxWidth().heightIn(min = 48.dp), enabled = st.folders.isNotEmpty() || st.gameOnly) { Text("Start sharing") }
                    }
                }
                if (sec == 3) {
                    item(key = "wifi") { WifiCard(st) }
                    item(key = "join") { JoinCard(onJoin) }
                }
                if (sec == 0) item(key = "setup") {
                    // Wi-Fi code, join-by-code and permissions are set up once, so they fold away (open while a permission is still missing)
                    var more by rememberSaveable { mutableStateOf(!(perms.notifications && perms.unrestricted)) }
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        TextButton({ more = !more }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
                            Text(if (more) "Hide set-up tools" else "Set-up tools: Wi-Fi code, join by code, permissions", fontWeight = FontWeight.SemiBold)
                        }
                        if (more) {
                            WifiCard(st)
                            JoinCard(onJoin)
                            PermissionsCard(perms) { p -> notif.launch(p) }
                        }
                    }
                }
                if (sec == 4) item(key = "perms") { PermissionsCard(perms) { p -> notif.launch(p) } }
                if ((sec == 0 || sec == 1) && st.running) item(key = "connected") {
                    SectionCard {
                        Text("Connected: ${st.devices.size} of ${st.maxClients} devices", fontWeight = FontWeight.SemiBold)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Let every guest use the TV remote", fontWeight = FontWeight.SemiBold)
                                Text("Off: only you and devices you allow on the Devices tab get a Remote button while LocalShare TV is connected.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                            }
                            Switch(st.remoteOn, { ShareController.setRemote(it) })
                        }
                        OutlinedButton(openBrowser, Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
                            Icon(Icons.Filled.PlayArrow, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Open the page here (files and game)")
                        }
                        OutlinedButton({ SendToTv.scan(ctx, st) { tvNote = it } }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
                            Text("Send to TV (scan the code on your TV)")
                        }
                        tvNote?.let { Text(it, color = MaterialTheme.colorScheme.secondary, style = MaterialTheme.typography.bodySmall) }
                    }
                }
                if (sec == 0 || sec == 4) item(key = "donate") {
                    SectionCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Enjoying LocalShare?", fontWeight = FontWeight.SemiBold)
                                Text("Even ₹1 helps me keep building it", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                            }
                            Spacer(Modifier.width(12.dp))
                            Button({ showDonate = true }, Modifier.heightIn(min = 48.dp)) { Text("Donate") }
                        }
                    }
                }
            }
            ProfileBar(st) { showProfile = true }
        }
    }
}

@Composable
private fun StatusCard(
    st: UiState,
    onStart: () -> Unit, onStop: () -> Unit, onCopy: (String) -> Unit,
) {
    val ctx = LocalContext.current
    val c = MaterialTheme.colorScheme
    var qrFor by remember { mutableStateOf<String?>(null) }
    val brush = Brush.verticalGradient(listOf(c.surfaceContainerHigh, c.surfaceContainer))
    val fg = c.onSurface
    val haptic = androidx.compose.ui.platform.LocalHapticFeedback.current
    Box(
        Modifier.fillMaxWidth().clip(MaterialTheme.shapes.extraLarge).background(brush)
            .border(1.dp, if (st.running) c.primary.copy(alpha = 0.55f) else c.outline, MaterialTheme.shapes.extraLarge).padding(22.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(34.dp).clip(RoundedCornerShape(10.dp)).background(if (st.running) c.primary else c.surfaceContainerHighest), contentAlignment = Alignment.Center) {
                    com.localshare.app.ui.LogoMark(22.dp, if (st.running) c.onPrimary else c.onSurfaceVariant, st.running)
                }
                Spacer(Modifier.width(10.dp))
                Text(if (st.running) "Sharing is ON" else "Sharing is OFF", color = fg, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }
            if (st.running) {
                if (st.urls.isEmpty()) Text("No network found. Connect to Wi-Fi or turn on your hotspot.", color = fg)
                Text(
                    if (st.urls.size > 1) "${st.urls.size} ways to connect (Wi-Fi and hotspot). Use any one." else "Open this address on any device on the same network.",
                    color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
                )
                st.urls.forEach { u ->
                    Surface(color = c.surfaceContainerHighest, shape = MaterialTheme.shapes.medium) {
                        Column(Modifier.padding(start = 14.dp, end = 6.dp, top = 10.dp, bottom = 2.dp)) {
                            Text(u, color = c.onSurface, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Row(horizontalArrangement = Arrangement.spacedBy(0.dp), verticalAlignment = Alignment.CenterVertically) {
                                TextButton({ qrFor = if (qrFor == u) null else u }, colors = ButtonDefaults.textButtonColors(contentColor = c.primary)) {
                                    Text(if (qrFor == u) "Hide QR" else "QR code")
                                }
                                TextButton({ onCopy(u) }, colors = ButtonDefaults.textButtonColors(contentColor = c.primary)) { Text("Copy") }
                                TextButton(
                                    { ctx.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, u), "Share link")) },
                                    colors = ButtonDefaults.textButtonColors(contentColor = c.primary),
                                ) { Text("Share") }
                            }
                        }
                    }
                }
                qrFor?.let { u ->
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        QrCode(u, 200.dp, "QR code for $u")
                        Text("Scan with the camera to open $u", color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                    }
                }
            } else {
                Text(
                    if (st.gameOnly) "Game-only mode is on (change it in the Game tab): guests can play but never see your files."
                    else if (st.folders.isEmpty()) "Add a folder below to get started." else "Ready to share ${st.folders.size} ${if (st.folders.size == 1) "folder" else "folders"}.",
                    color = c.onSurfaceVariant,
                )
            }
            st.error?.let { Text(it, color = c.error) }
            Button(
                onClick = { haptic.performHapticFeedback(androidx.compose.ui.hapticfeedback.HapticFeedbackType.LongPress); if (st.running) onStop() else onStart() },
                enabled = st.running || st.folders.isNotEmpty() || st.gameOnly,
                colors = if (st.running) ButtonDefaults.buttonColors(containerColor = c.surfaceContainerHighest, contentColor = c.primary) else ButtonDefaults.buttonColors(),
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) { Text(if (st.running) "Stop sharing" else "Start sharing", fontWeight = FontWeight.Bold) }
        }
    }
}

@Composable
private fun FoldersCard(st: UiState, onAdd: () -> Unit) {
    SectionCard {
        Text("Shared folders", fontWeight = FontWeight.SemiBold, modifier = Modifier.semantics { heading() })
        Text("People who join pick which of these to open.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        if (st.folders.isEmpty()) Column(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(painterResource(R.drawable.ic_folder), null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(40.dp))
            Text("Nothing shared yet", style = MaterialTheme.typography.titleMedium)
            Text("Pick a folder and anyone on your Wi-Fi can open it in a browser.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
        st.folders.forEachIndexed { i, f ->
            var menu by remember { mutableStateOf(false) }
            val c = MaterialTheme.colorScheme
            if (i > 0) HorizontalDivider(color = c.outlineVariant)
            Row(Modifier.fillMaxWidth().heightIn(min = 60.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(c.primaryContainer), contentAlignment = Alignment.Center) {
                    Icon(painterResource(R.drawable.ic_folder), null, tint = c.primary, modifier = Modifier.size(26.dp))
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(f.name, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(if (st.running) "Shared folder · visible to guests" else "Shared folder", color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                }
                Box {
                    IconButton({ menu = true }) { Icon(Icons.Filled.MoreVert, "Options for ${f.name}", tint = c.onSurfaceVariant) }
                    DropdownMenu(menu, { menu = false }) {
                        DropdownMenuItem({ Text("Stop sharing") }, {
                            menu = false
                            ShareController.removeFolder(f.uri, release = false)
                            com.localshare.app.ui.Snack.show("Stopped sharing ${f.name}", { ShareController.addFolder(Uri.parse(f.uri)) }, { ShareController.releaseFolder(f.uri) })
                        })
                    }
                }
            }
        }
        FilledTonalButton(onAdd, Modifier.fillMaxWidth().heightIn(min = 48.dp)) {
            Icon(Icons.Filled.Add, null)
            Spacer(Modifier.width(8.dp))
            Text(if (st.folders.isEmpty()) "Add a folder" else "Add another folder")
        }
    }
}

@Composable
private fun PermissionsCard(perms: Perms, askNotifications: (String) -> Unit) {
    val ctx = LocalContext.current
    SectionCard {
        Text("Keep sharing when the screen is locked", fontWeight = FontWeight.SemiBold, modifier = Modifier.semantics { heading() })
        Text(
            "LocalShare only needs these so Android does not put it to sleep. It never reads anything outside the folders you add.",
            color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
        )
        if (Build.VERSION.SDK_INT >= 33) PermRow(
            "Show a notice while sharing", "Android needs this small notice to let sharing keep running with the screen off. You can stop sharing from it.",
            perms.notifications, "Allow",
        ) { askNotifications(Manifest.permission.POST_NOTIFICATIONS) }
        if (Build.VERSION.SDK_INT >= 23) PermRow(
            "Don't limit battery use", "Without this, Android can stop sharing a few minutes after you leave the app or lock the phone, which restarts games and signs guests out. Tap Allow, then choose Allow in the box that opens.",
            perms.unrestricted, "Allow",
        ) { requestUnrestricted(ctx) }
        Text(
            "Xiaomi, Oppo, Vivo and Samsung phones also have an “Autostart” or “Battery” switch in the app's settings. Turn it on if sharing stops by itself.",
            color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
        )
        TextButton({
            ctx.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}")))
        }, Modifier.heightIn(min = 48.dp)) { Text("Open app settings") }
    }
}

@Composable
private fun PermRow(title: String, why: String, ok: Boolean, action: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Icon(
            if (ok) Icons.Filled.Check else Icons.Filled.Warning,
            if (ok) "Done" else "Needs attention",
            tint = if (ok) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
        )
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.SemiBold)
            Text(why, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        }
        if (!ok) {
            Spacer(Modifier.width(8.dp))
            FilledTonalButton(onClick, Modifier.heightIn(min = 48.dp)) { Text(action) }
        }
    }
}

/** "mm:ss" (or "h:mm:ss") since the share began, ticking every second. */
@Composable
private fun liveClock(since: Long): String {
    val now by produceState(System.currentTimeMillis()) { while (true) { kotlinx.coroutines.delay(1000); value = System.currentTimeMillis() } }
    val s = if (since > 0) ((now - since) / 1000).coerceAtLeast(0) else 0L
    return if (s >= 3600) "%d:%02d:%02d".format(s / 3600, s % 3600 / 60, s % 60) else "%02d:%02d".format(s / 60, s % 60)
}

/** Share this phone's screen: people you let in get a Watch screen button on the page. */
@Composable
private fun ScreenCard(st: UiState, onCast: () -> Unit) {
    val ctx = LocalContext.current
    SectionCard {
        Text("Share your screen", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(
            when {
                !st.running -> "Start sharing first, then you can show your screen to the devices that joined."
                st.casting -> "Your screen is live for ${liveClock(st.castSince)}. ${st.viewers} watching. Everything on your screen is visible, so be careful with passwords and private chats."
                else -> "Devices that joined see a Watch screen button. They can only watch."
            },
            color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium,
        )
        if (st.casting && st.castSilent) Text("No sound captured for a while. If something is playing, that app may not allow its sound to be shared (Netflix, calls and some music apps block it).", color = MaterialTheme.colorScheme.secondary, style = MaterialTheme.typography.bodySmall)
        if (st.casting && st.castMeter.isNotEmpty()) Text(st.castMeter, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
        if (st.casting && st.castNote.isNotEmpty()) Text(st.castNote + " to keep your phone cool.", color = MaterialTheme.colorScheme.secondary, style = MaterialTheme.typography.bodySmall)
        if (!st.casting) Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Compatibility mode", fontWeight = FontWeight.SemiBold)
                Text("Only for very old browsers. Uses more battery and looks less smooth.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
            }
            Switch(st.castCompat, { ShareController.setCastCompat(it) })
        }
        if (!st.casting) Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Also send my microphone", fontWeight = FontWeight.SemiBold)
                Text("Your voice is heard along with the phone's sound.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
            }
            Switch(st.castMic, { ShareController.setCastMic(it) })
        }
        if (st.casting) Button({ CastService.stop(ctx) }, Modifier.fillMaxWidth().heightIn(min = 48.dp), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error, contentColor = MaterialTheme.colorScheme.onError)) { Text("Stop sharing screen") }
        else OutlinedButton(onCast, Modifier.fillMaxWidth().heightIn(min = 48.dp), enabled = st.running) { Text("Start sharing screen") }
    }
}

/** Read and answer the live chat without opening the browser page. */
@Composable
private fun ChatCard(st: UiState) {
    var msg by rememberSaveable { mutableStateOf("") }
    SectionCard {
        Text("Live chat", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        if (st.chat.isEmpty()) Text("No messages yet. Guests chat from the page, and you can answer here.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        st.chat.forEach { c ->
            Text(buildAnnotatedString {
                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = if (c.host) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)) { append(c.name + ": ") }
                append(c.text)
            }, style = MaterialTheme.typography.bodyMedium)
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(msg, { if (it.length <= 300) msg = it }, Modifier.weight(1f), singleLine = true, label = { Text("Message everyone") })
            Button({ ShareController.chatSay(msg); msg = "" }, Modifier.heightIn(min = 48.dp), enabled = msg.isNotBlank()) { Text("Send") }
        }
        Text("Slow mode (guests only)", fontWeight = FontWeight.SemiBold)
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(0 to "Off", 5 to "5 s", 15 to "15 s", 30 to "30 s").forEach { (s, l) -> FilterChip(st.chatSlow == s, { ShareController.setChatSlow(s) }, { Text(l) }) }
        }
        Text("To mute a guest or delete a message, use the host controls on the web page.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
    }
}

private fun leftText(ms: Long): String {
    val m = (ms - System.currentTimeMillis()) / 60000
    return when { m <= 0 -> "expired"; m < 60 -> "$m min left"; m < 48 * 60 -> "${m / 60} h left"; else -> "${m / 1440} days left" }
}

/** Links that let a friend in without the password until they expire. */
@Composable
private fun InviteCard(st: UiState) {
    val ctx = LocalContext.current
    val clip = LocalClipboardManager.current
    var hours by rememberSaveable { mutableStateOf(24) }
    var uses by rememberSaveable { mutableStateOf(1) }
    var qrFor by remember { mutableStateOf<String?>(null) }
    var tick by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) { while (true) { kotlinx.coroutines.delay(30000); tick++ } }
    val base = st.urls.firstOrNull()
    SectionCard {
        Text("Invite links", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("Give a friend a link that works without the password, for a limited time. You can cancel it at any time.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        if (!st.running || base == null) { Text("Start sharing first.", color = MaterialTheme.colorScheme.onSurfaceVariant); return@SectionCard }
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(1 to "1 hour", 24 to "1 day", 168 to "7 days").forEach { (h, l) -> FilterChip(hours == h, { hours = h }, { Text(l) }) }
        }
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(1 to "One person", 5 to "Five people", -1 to "Anyone").forEach { (n, l) -> FilterChip(uses == n, { uses = n }, { Text(l) }) }
        }
        Button({ ShareController.createInvite(hours, uses) }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Text("Create invite link") }
        st.invites.forEach { inv ->
            val url = "$base/#inv=${inv.token}"
            @Suppress("UNUSED_EXPRESSION") tick
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("${leftText(inv.expires)} · ${if (inv.uses < 0) "anyone" else "${inv.uses} left"}", fontWeight = FontWeight.SemiBold)
                Text(url, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Row(Modifier.horizontalScroll(rememberScrollState())) {
                    TextButton({ clip.setText(AnnotatedString(url)); android.widget.Toast.makeText(ctx, "Link copied", android.widget.Toast.LENGTH_SHORT).show() }) { Text("Copy") }
                    TextButton({
                        ctx.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, "Join my LocalShare: $url"), "Share invite"))
                    }) { Text("Share") }
                    TextButton({ qrFor = if (qrFor == inv.token) null else inv.token }) { Text(if (qrFor == inv.token) "Hide QR" else "QR code") }
                    TextButton({ ShareController.revokeInvite(inv.token) }, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) { Text("Cancel") }
                }
                if (qrFor == inv.token) Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { QrCode(url, 200.dp, "QR code for the invite link") }
            }
        }
    }
}

private fun wifiEsc(s: String) = s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace(":", "\\:").replace("\"", "\\\"")

/** A QR code that joins this Wi-Fi network, so guests can connect before opening the link. */
@Composable
private fun WifiCard(st: UiState) {
    var ssid by rememberSaveable { mutableStateOf(st.wifiSsid) }
    var pass by rememberSaveable { mutableStateOf(st.wifiPass) }
    var show by rememberSaveable { mutableStateOf(false) }
    SectionCard {
        Text("Wi-Fi QR code", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("Guests scan this with their camera to join your Wi-Fi. Android does not let apps read the Wi-Fi password, so type it here once. It stays on this phone.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        OutlinedTextField(ssid, { ssid = it; ShareController.setWifi(it, pass) }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Network name") })
        OutlinedTextField(pass, { pass = it; ShareController.setWifi(ssid, it) }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Password (leave empty for an open network)") })
        OutlinedButton({ show = !show }, Modifier.fillMaxWidth().heightIn(min = 48.dp), enabled = ssid.isNotBlank()) { Text(if (show) "Hide QR code" else "Show QR code") }
        if (show && ssid.isNotBlank()) {
            val code = if (pass.isEmpty()) "WIFI:T:nopass;S:${wifiEsc(ssid)};;" else "WIFI:T:WPA;S:${wifiEsc(ssid)};P:${wifiEsc(pass)};;"
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { QrCode(code, 220.dp, "QR code to join the Wi-Fi network") }
        }
    }
}

/** Open another phone's LocalShare inside this app: the same page a browser would show. */
@Composable
private fun JoinCard(onJoin: (String) -> Unit) {
    var link by rememberSaveable { mutableStateOf("") }
    SectionCard {
        Text("Join another share", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("Type the link shown on the other phone (like http://192.168.1.5:8080). You get files, viewers, the game and its screen, just like in a browser.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        OutlinedTextField(
            link, { link = it }, Modifier.fillMaxWidth(), singleLine = true, label = { Text("Link") },
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Uri, imeAction = androidx.compose.ui.text.input.ImeAction.Go),
            keyboardActions = androidx.compose.foundation.text.KeyboardActions(onGo = { if (link.isNotBlank()) onJoin(link) }),
        )
        Button({ onJoin(link) }, Modifier.fillMaxWidth().heightIn(min = 48.dp), enabled = link.isNotBlank()) { Text("Open") }
    }
}

/** The circle: how much of this phone's storage is being shared. */
@Composable
private fun StorageCard(st: UiState) {
    val ctx = LocalContext.current
    val s = st.storage
    val total = s.total.coerceAtLeast(1L)
    val used = (s.total - s.free).coerceAtLeast(0L)
    val otherBytes = (used - s.sharedBytes).coerceAtLeast(0L)
    fun sz(b: Long) = android.text.format.Formatter.formatShortFileSize(ctx, b)
    SectionCard {
        Text("Storage shared", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Row(verticalAlignment = Alignment.CenterVertically) {
            StorageRing(s.sharedBytes.toFloat() / total, otherBytes.toFloat() / total, 140.dp, Modifier.clickable { ShareController.measure() }) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(if (s.counting && s.sharedBytes == 0L) "…" else sz(s.sharedBytes), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                    Text(if (s.total > 0) "of ${sz(s.total)}" else "shared", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                }
            }
            Spacer(Modifier.width(18.dp))
            Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                Legend(MaterialTheme.colorScheme.primary, "Shared", sz(s.sharedBytes))
                Legend(MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.55f), "Other on phone", sz(otherBytes))
                Legend(MaterialTheme.colorScheme.surfaceContainerHighest, "Free", sz(s.free))
            }
        }
        Text(
            if (s.counting) "Counting your shared files…"
            else "${s.files} files in ${s.folders} folders${if (s.partial) " (still counting, huge folder)" else ""}. Tap the circle to recount.",
            color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
        )
    }
}

@Composable
private fun Legend(color: androidx.compose.ui.graphics.Color, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(10.dp).background(color, androidx.compose.foundation.shape.CircleShape))
        Spacer(Modifier.width(8.dp))
        Column {
            Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
            Text(value, fontWeight = FontWeight.SemiBold)
        }
    }
}
