package com.localshare.app

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localshare.app.ui.LogoMark

private val TILE = 48.dp

/** One round tile in the left rail, like a Discord server icon: the selected one becomes a rounded square with a yellow pill at the edge. */
@Composable
private fun RailTile(
    label: String, selected: Boolean, onClick: () -> Unit,
    active: Boolean = false, dim: Boolean = false, badge: String? = null, dot: Boolean = false,
    icon: @Composable (Color) -> Unit,
) {
    val c = MaterialTheme.colorScheme
    val corner by animateDpAsState(if (selected) 16.dp else 24.dp, label = "corner")
    val pill by animateDpAsState(if (selected) 32.dp else 0.dp, label = "pill")
    val lit = selected || active
    Column(
        Modifier.fillMaxWidth().alpha(if (dim) 0.45f else 1f)
            .clickable(onClickLabel = label, role = Role.Tab, onClick = onClick)
            .semantics { contentDescription = label; this.selected = selected },
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(Modifier.fillMaxWidth().height(TILE)) {
            Box(Modifier.align(Alignment.CenterStart).width(4.dp).height(pill).clip(RoundedCornerShape(topEnd = 4.dp, bottomEnd = 4.dp)).background(c.primary))
            Box(
                Modifier.align(Alignment.Center).size(TILE).clip(RoundedCornerShape(corner)).background(if (lit) c.primary else c.surfaceContainerHigh),
                contentAlignment = Alignment.Center,
            ) { icon(if (lit) c.onPrimary else c.onSurface) }
            if (badge != null) Box(
                Modifier.align(Alignment.BottomEnd).padding(end = 8.dp).clip(CircleShape).background(c.error).padding(horizontal = 6.dp, vertical = 1.dp),
            ) { Text(badge, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = c.onError) }
            if (dot) Box(Modifier.align(Alignment.TopEnd).padding(end = 12.dp, top = 2.dp).size(12.dp).clip(CircleShape).background(c.error))
        }
        Text(label, fontSize = 10.sp, maxLines = 1, color = if (selected) c.primary else c.onSurfaceVariant, modifier = Modifier.padding(top = 2.dp))
    }
}

/** The left rail: the logo (everything), the quick actions (start or stop, live screen, chat) and the sections. */
@Composable
internal fun HomeRail(st: UiState, sec: Int, chatDot: Boolean, onSec: (Int) -> Unit, onStartStop: () -> Unit, onLive: () -> Unit) {
    val c = MaterialTheme.colorScheme
    Column(
        Modifier.width(76.dp).fillMaxHeight().background(Color.Black).verticalScroll(rememberScrollState()).padding(vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        RailTile("All", sec == 0, { onSec(0) }, active = true) { fg -> LogoMark(28.dp, fg, st.running) }
        HorizontalDivider(Modifier.width(36.dp), color = c.outlineVariant)
        RailTile(if (st.running) "Stop" else "Start", false, onStartStop, active = st.running) { fg ->
            Icon(if (st.running) Icons.Filled.Close else Icons.Filled.PlayArrow, null, tint = fg)
        }
        RailTile("Live", false, onLive, active = st.casting, dim = !st.running, badge = if (st.casting && st.viewers > 0) "${st.viewers}" else null) { fg ->
            Icon(painterResource(R.drawable.ic_eye), null, tint = fg)
        }
        RailTile("Chat", sec == 5, { onSec(5) }, dot = chatDot) { fg -> Icon(Icons.Filled.Email, null, tint = fg) }
        HorizontalDivider(Modifier.width(36.dp), color = c.outlineVariant)
        RailTile("Sharing", sec == 1, { onSec(1) }) { fg -> Icon(Icons.Filled.Share, null, tint = fg) }
        RailTile("Folders", sec == 2, { onSec(2) }) { fg -> Icon(painterResource(R.drawable.ic_folder), null, tint = fg) }
        RailTile("Access", sec == 3, { onSec(3) }) { fg -> Icon(Icons.Filled.Lock, null, tint = fg) }
        RailTile("Support", sec == 4, { onSec(4) }) { fg -> Icon(Icons.Filled.Favorite, null, tint = fg) }
        RailTile("Look", sec == 6, { onSec(6) }) { fg -> Icon(Icons.Filled.Edit, null, tint = fg) }
    }
}

@Composable
internal fun SectionHeader(sec: Int, st: UiState) {
    val (title, sub) = when (sec) {
        1 -> "Sharing" to (if (st.running) "On · ${st.devices.size} connected" else "Off")
        2 -> "Folders" to "${st.folders.size} shared from this phone"
        3 -> "Access" to "Who can join, and how"
        4 -> "Support" to "Keep it running, and say thanks"
        6 -> "Appearance" to "Colours for the app, icon and games"
        5 -> "Live chat" to (if (st.running) "Everyone who joined can see this" else "Start sharing to chat")
        else -> "LocalShare" to "Everything in one place"
    }
    Column(Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, top = 14.dp, bottom = 10.dp)) {
        Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, modifier = Modifier.semantics { heading() })
        Text(sub, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
    }
}

/** The host's picture in a circle. [ver] changes whenever the picture does. */
@Composable
internal fun HostAvatar(size: Dp, ver: Int) {
    val bmp = remember(ver) { ShareController.hostBitmap()?.asImageBitmap() }
    Box(Modifier.size(size).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceContainerHigh)) {
        if (bmp != null) Image(bmp, null, Modifier.fillMaxSize())
    }
}

/** Bottom bar like Discord's profile bar: the host's picture and name, with a status line. Tap to edit. */
@Composable
internal fun ProfileBar(st: UiState, onClick: () -> Unit) {
    val c = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(28.dp)
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp).clip(shape).background(c.surfaceContainer)
            .border(1.dp, c.outlineVariant, shape).clickable(onClickLabel = "Edit your profile", onClick = onClick).padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box {
            HostAvatar(44.dp, st.hostPicVer)
            Box(Modifier.align(Alignment.BottomEnd).size(16.dp).clip(CircleShape).background(c.surfaceContainer).padding(3.dp).clip(CircleShape).background(if (st.running) c.primary else c.onSurfaceVariant))
        }
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(st.hostName, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(if (st.running) "Sharing · ${st.devices.size} here" else "Not sharing", color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        }
        Icon(Icons.Filled.Settings, null, tint = c.onSurfaceVariant, modifier = Modifier.padding(end = 8.dp))
    }
}

@Composable
private fun LogoChoice(kind: Int, selected: Boolean) {
    val c = MaterialTheme.colorScheme
    val bmp = remember(kind) { HostProfile.logoBitmap(kind, 112).asImageBitmap() }
    Box(
        Modifier.size(56.dp).clip(CircleShape).border(if (selected) 3.dp else 1.dp, if (selected) c.primary else c.outlineVariant, CircleShape)
            .clickable(onClickLabel = "Use this logo") { ShareController.setHostLogo(kind) }
            .semantics { contentDescription = "Logo ${kind + 1}"; this.selected = selected },
    ) { Image(bmp, null, Modifier.fillMaxSize().padding(3.dp).clip(CircleShape)) }
}

/** Change the name guests see, take a photo from the phone, or pick one of the built-in logos. */
@Composable
internal fun ProfileDialog(st: UiState, onClose: () -> Unit) {
    var name by remember { mutableStateOf(st.hostName) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> if (uri != null) ShareController.setHostPhoto(uri) }
    val done = { ShareController.setHostName(name); onClose() }
    AlertDialog(
        onDismissRequest = done,
        title = { Text("Your profile") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    HostAvatar(72.dp, st.hostPicVer)
                    OutlinedTextField(name, { if (it.length <= 24) name = it }, singleLine = true, label = { Text("Name guests see") })
                }
                OutlinedButton({ pick.launch("image/*") }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Text("Choose a photo") }
                Text("Or pick a logo", fontWeight = FontWeight.SemiBold)
                for (r in 0 until 2) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    for (i in 0 until 4) { val k = r * 4 + i; LogoChoice(k, st.hostPicKind == "logo:$k") }
                }
                Text(
                    "Guests who joined see this name and picture next to your chat messages and in the page header.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
                )
            }
        },
        confirmButton = { TextButton(done) { Text("Done") } },
    )
}
