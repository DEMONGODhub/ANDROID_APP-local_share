package com.localshare.app

import com.localshare.app.ui.Button
import com.localshare.app.ui.OutlinedButton
import com.localshare.app.ui.TextButton
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import android.text.format.DateUtils
import com.localshare.app.ui.SectionCard

@Composable
fun DevicesScreen(st: UiState) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    var editing by remember { mutableStateOf<String?>(null) }
    var tab by rememberSaveable { mutableStateOf(0) } // 0 connected, 1 blocked
    LazyColumn(Modifier.fillMaxSize().statusBarsPadding(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Devices", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, modifier = Modifier.semantics { heading() })
                    Text(if (st.running) "${st.devices.size} of ${st.maxClients} connected" else "Not sharing", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Info("Connected devices can use your shared folders and the game. Tap the gear to choose what a device may do, or the menu to disconnect or block it.\n\nBlocking removes the device now and refuses it again by IP address and by its browser's device ID. Android does not let apps read other devices' MAC addresses, so someone who changes both can get back in. Set a password too.")
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(tab == 0, { tab = 0 }, { Text("Connected  ${st.devices.size}") })
                FilterChip(tab == 1, { tab = 1 }, { Text("Blocked  ${st.blocks.size}") })
            }
        }
        if (tab == 0 && st.waiting.isNotEmpty()) {
            items(st.waiting, key = { "w" + it.id }) { d ->
                SectionCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(d.name, false)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("${d.name} wants to join", fontWeight = FontWeight.SemiBold)
                            Text(d.ip, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton({ ShareController.approve(d.id, false) }, Modifier.weight(1f).heightIn(min = 48.dp)) { Text("Deny") }
                        Button({ if (!ShareController.approve(d.id, true)) android.widget.Toast.makeText(ctx, "The room is full. Raise the device limit in Settings.", android.widget.Toast.LENGTH_LONG).show() }, Modifier.weight(1f).heightIn(min = 48.dp)) { Text("Allow") }
                    }
                }
            }
        }
        if (tab == 0) {
            if (st.devices.isEmpty()) item { Empty(if (st.running) "Nobody is connected yet" else "Start sharing to let devices connect", if (st.running) "Open the Share tab and show the QR code or the link." else "") }
            items(st.devices, key = { it.id }) { d ->
                var menu by remember { mutableStateOf(false) }
                DeviceRow(d.name, d.ip, false, chip = permsNote(d.perms, st.gameOnly)) {
                    IconButton({ editing = d.id }, Modifier.size(48.dp)) { Icon(Icons.Filled.Settings, "Settings for ${d.name}") }
                    Box {
                        IconButton({ menu = true }, Modifier.size(48.dp)) { Icon(Icons.Filled.MoreVert, "More for ${d.name}") }
                        DropdownMenu(menu, { menu = false }) {
                            DropdownMenuItem({ Text("Disconnect") }, { menu = false; ShareController.kick(d.id) })
                            DropdownMenuItem({ Text("Block", color = MaterialTheme.colorScheme.error) }, { menu = false; ShareController.block(d.id); com.localshare.app.ui.Snack.show("Blocked ${d.name}", { ShareController.unblock(d.id) }) })
                        }
                    }
                }
            }
        } else {
            if (st.blocks.isEmpty()) item { Empty("No blocked devices", "Devices you block show up here so you can let them back in.") }
            items(st.blocks, key = { it.id }) { b ->
                DeviceRow(b.name, b.ip.ifEmpty { "device ID" }, blocked = true) {
                    OutlinedButton({ ShareController.unblock(b.id) }, Modifier.heightIn(min = 48.dp)) { Text("Unblock") }
                }
            }
        }
    }
    st.devices.firstOrNull { it.id == editing }?.let { d -> DevicePermsDialog(d, st) { editing = null } }
}

@Composable
private fun Avatar(name: String, blocked: Boolean) {
    Box(
        Modifier.size(44.dp).clip(CircleShape).background(if (blocked) MaterialTheme.colorScheme.error.copy(alpha = .18f) else MaterialTheme.colorScheme.primary.copy(alpha = .18f)),
        contentAlignment = Alignment.Center,
    ) {
        if (blocked) Icon(painterResource(R.drawable.ic_block), null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(22.dp))
        else Text(name.take(1).uppercase(), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
private fun Empty(title: String, sub: String) {
    Column(Modifier.fillMaxWidth().padding(vertical = 36.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(title, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleMedium)
        if (sub.isNotEmpty()) Text(sub, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}

private fun permsNote(p: Int, gameOnlyMode: Boolean): String {
    if (p and 64 != 0) return "Manager"
    if (gameOnlyMode) return "Game only"
    if (p and 8 != 0) return "Game only"
    val on = listOfNotNull(if (p and 16 != 0) "upload" else null, if (p and 1 != 0) "delete" else null, if (p and 2 != 0) "rename" else null, if (p and 32 != 0) "move" else null, if (p and 4 != 0) "edit" else null, if (p and 256 != 0) "use the TV remote" else null)
    return if (on.isEmpty()) "" else "Can " + on.joinToString(", ")
}

@Composable
private fun PermRow(title: String, sub: String, checked: Boolean, enabled: Boolean = true, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 56.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.SemiBold, color = if (enabled) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant)
            Text(sub, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        }
        Spacer(Modifier.width(12.dp))
        Switch(checked, onChange, enabled = enabled)
    }
}

/** What this one device may do, on top of the global settings. */
@Composable
private fun DevicePermsDialog(d: Device, st: UiState, onClose: () -> Unit) {
    val p = d.perms
    fun set(bit: Int, on: Boolean) = ShareController.setDevicePerms(d.id, if (on) p or bit else p and bit.inv())
    val gameOnly = st.gameOnly || p and 8 != 0
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Settings for ${d.name}") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                PermRow("Manager", "Can run the game for you: modes, super powers and spectators", p and 64 != 0) { ShareController.setManager(d.id, it) }
                PermRow("Game only", "Can play the game but never see your files", gameOnly, enabled = !st.gameOnly && st.gameEnabled) { set(8, it) }
                PermRow("Upload files", "Can add files to your shared folders", p and 16 != 0 || (st.allowUploads && !gameOnly), enabled = !gameOnly) { set(16, it) }
                PermRow("Delete files and folders", "Can delete files and folders", p and 1 != 0 || (st.allowDelete && !gameOnly), enabled = !gameOnly) { set(1, it) }
                PermRow("Rename files and folders", "Can rename them", p and 2 != 0, enabled = !gameOnly) { set(2, it) }
                PermRow("Move files and folders", "Can move them into other folders", p and 32 != 0, enabled = !gameOnly) { set(32, it) }
                PermRow("Use the TV remote", "Can press the remote on the web page while LocalShare TV is connected", p and 256 != 0 || (st.remoteOn && !gameOnly), enabled = !gameOnly) { set(256, it) }
                PermRow("Edit text files", "Can change .txt, .md, .json and other text files (up to 512 KB)", p and 4 != 0, enabled = !gameOnly) { set(4, it) }
                Text(
                    if (st.gameOnly) "Game-only mode is on for everyone."
                    else if (!st.gameEnabled) "Turn on the game in the Game tab to use Game only."
                    else "Applies to this device and is remembered for its browser.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 6.dp),
                )
            }
        },
        confirmButton = { TextButton(onClose) { Text("Done") } },
    )
}

@Composable
private fun DeviceRow(name: String, sub: String, blocked: Boolean = false, chip: String = "", actions: @Composable RowScope.() -> Unit) {
    SectionCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Avatar(name, blocked)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(name, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(sub, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                if (chip.isNotEmpty()) Text(chip, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
            }
            actions()
        }
    }
}

private fun describe(l: LogLine): String = when (l.kind) {
    "join" -> "joined"
    "view" -> "opened ${l.detail}"
    "download" -> "downloaded ${l.detail}"
    "zip" -> "downloaded ZIP of ${l.detail}"
    "upload" -> "uploaded ${l.detail}"
    "delete" -> "deleted ${l.detail}"
    "rename" -> "renamed ${l.detail}"
    "move" -> "moved ${l.detail}"
    "power" -> "gave a super power: ${l.detail}"
    "mode" -> "switched the game to ${l.detail}"
    "edit" -> "edited ${l.detail}"
    "perms" -> "had permissions changed by you"
    "kick" -> "was removed by you"
    "block" -> "was blocked by you"
    "blocked" -> "tried to join but is blocked"
    "denied" -> "was refused (${l.detail})"
    "full" -> "could not join: room full"
    "folder" -> "opened folder ${l.detail}"
    "alert" -> l.detail
    "offer" -> "wants to send ${l.detail}"
    else -> l.detail.ifEmpty { l.kind }
}

private fun isAlert(kind: String) = kind == "denied" || kind == "blocked" || kind == "alert" || kind == "full"
private fun isOpen(kind: String) = kind == "folder" || kind == "view" || kind == "download" || kind == "zip"

private val T_GREEN = Color(0xFF7CFC7C)
private val T_CYAN = Color(0xFF4DD0E1)
private val T_AMBER = Color(0xFFFFC107)
private val T_RED = Color(0xFFFF6B6B)

/** Activity as a terminal: what guests open and do, with security alerts in red. */
@Composable
fun ActivityScreen(st: UiState) {
    var f by rememberSaveable { mutableStateOf(0) } // 0 everything, 1 folders and files, 2 security
    val clock = remember { java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault()) }
    val shown = st.log.filter { when (f) { 1 -> isOpen(it.kind); 2 -> isAlert(it.kind); else -> true } }
    val alerts = st.log.count { isAlert(it.kind) }
    Column(Modifier.fillMaxSize().statusBarsPadding().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Activity", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, modifier = Modifier.semantics { heading() })
                Text(if (alerts > 0) "$alerts security ${if (alerts == 1) "alert" else "alerts"}" else "All quiet", color = if (alerts > 0) T_RED else MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Info("A live record of what people do on your share: which folders they open, what they download, upload, delete or rename.\n\nRed lines are security alerts: a wrong password, someone who is locked out or blocked, a full room, or a request that tries to leave the shared folders.")
            if (st.log.isNotEmpty()) TextButton({ ShareController.clearLog() }, Modifier.heightIn(min = 48.dp)) { Text("Clear") }
        }
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(f == 0, { f = 0 }, { Text("Everything") })
            FilterChip(f == 1, { f = 1 }, { Text("Folders and files") })
            FilterChip(f == 2, { f = 2 }, { Text(if (alerts > 0) "Security  $alerts" else "Security") })
        }
        Column(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color(0xFF0A0D0A)).padding(12.dp)) {
            Row(Modifier.padding(bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                listOf(T_RED, T_AMBER, T_GREEN).forEach { Box(Modifier.size(9.dp).clip(CircleShape).background(it)) }
                Text("  host@localshare:~$ tail -f activity", color = T_GREEN.copy(alpha = .8f), fontFamily = FontFamily.Monospace, fontSize = 12.sp, maxLines = 1)
            }
            if (shown.isEmpty()) Text(if (st.running) "$ waiting for activity…" else "$ start sharing to see activity", color = T_GREEN.copy(alpha = .6f), fontFamily = FontFamily.Monospace, fontSize = 13.sp)
            // newest line sits at the bottom, like a terminal
            LazyColumn(Modifier.weight(1f), reverseLayout = true, verticalArrangement = Arrangement.spacedBy(5.dp)) {
                items(shown, key = { "${it.time}${it.who}${it.kind}${it.detail}" }) { l ->
                    val col = when { isAlert(l.kind) -> T_RED; l.kind == "kick" || l.kind == "block" || l.kind == "delete" -> T_AMBER; isOpen(l.kind) -> T_CYAN; else -> T_GREEN }
                    val who = l.who.ifEmpty { "someone" } + if (l.ip.isNotEmpty()) "@${l.ip}" else ""
                    Text(
                        "[${clock.format(java.util.Date(l.time))}] ${if (isAlert(l.kind)) "ALERT " else ""}$who ${describe(l)}",
                        color = col, fontFamily = FontFamily.Monospace, fontSize = 13.sp, lineHeight = 17.sp,
                    )
                }
            }
        }
    }
}
