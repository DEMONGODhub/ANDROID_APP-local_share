package com.localshare.app

import android.graphics.BitmapFactory
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val AVATAR_COLORS = listOf(
    0xFFE57373, 0xFFBA68C8, 0xFF7986CB, 0xFF4FC3F7, 0xFF4DB6AC, 0xFF81C784, 0xFFFFB74D, 0xFFA1887F,
).map { Color(it) }

private fun colorFor(name: String) = AVATAR_COLORS[(name.hashCode() and 0x7fffffff) % AVATAR_COLORS.size]

/** A modern messaging screen: bubbles, avatars, photos, a pill-shaped composer and a menu for slow mode. */
@OptIn(ExperimentalFoundationApi::class)
@Composable
internal fun ChatScreen(st: UiState, modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val c = MaterialTheme.colorScheme
    var msg by rememberSaveable { mutableStateOf("") }
    var viewing by remember { mutableStateOf<Long?>(null) }
    var menu by remember { mutableStateOf(false) }
    val list = rememberLazyListState()
    val rows = st.chat
    val clock = remember { SimpleDateFormat("h:mm a", Locale.getDefault()) }
    LaunchedEffect(rows.lastOrNull()?.id) { if (rows.isNotEmpty()) list.animateScrollToItem(rows.size - 1) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) scope.launch {
            val ok = withContext(Dispatchers.IO) { ShareController.chatSayPicture(ctx, uri) }
            if (!ok) Toast.makeText(ctx, "Could not send that picture", Toast.LENGTH_SHORT).show()
        }
    }
    Column(modifier.imePadding()) {
        Row(Modifier.fillMaxWidth().padding(start = 16.dp, end = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(
                if (st.chatSlow > 0) "Slow mode: one message every ${st.chatSlow} s" else "${st.devices.size} here now",
                Modifier.weight(1f), color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
            )
            Box {
                IconButton({ menu = true }) { Icon(Icons.Filled.MoreVert, "Chat options") }
                DropdownMenu(menu, { menu = false }) {
                    listOf(0 to "Slow mode: off", 5 to "Slow mode: 5 s", 15 to "Slow mode: 15 s", 30 to "Slow mode: 30 s").forEach { (s, l) ->
                        DropdownMenuItem({ Text(l, fontWeight = if (st.chatSlow == s) FontWeight.Bold else FontWeight.Normal) }, { ShareController.setChatSlow(s); menu = false })
                    }
                }
            }
        }
        Box(Modifier.weight(1f).fillMaxWidth()) {
            if (rows.isEmpty()) {
                Column(Modifier.align(Alignment.Center).padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("No messages yet", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text("Say hello, or send a photo. Everyone on your share sees it.", color = c.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                }
            } else LazyColumn(
                Modifier.fillMaxSize(), state = list,
                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp),
            ) {
                itemsIndexed(rows, key = { _, r -> r.id }) { i, r ->
                    val prev = rows.getOrNull(i - 1)
                    val next = rows.getOrNull(i + 1)
                    val first = prev == null || prev.name != r.name || prev.host != r.host || r.time - prev.time > 5 * 60_000
                    val last = next == null || next.name != r.name || next.host != r.host || next.time - r.time > 5 * 60_000
                    Bubble(r, first, last, clock.format(Date(r.time)), onPhoto = { viewing = r.id })
                }
            }
        }
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            IconButton({ pick.launch("image/*") }, enabled = st.running) { Icon(Icons.Filled.Add, "Send a photo") }
            TextField(
                msg, { if (it.length <= 300) msg = it }, Modifier.weight(1f),
                placeholder = { Text("Message") }, maxLines = 4, shape = RoundedCornerShape(24.dp),
                colors = TextFieldDefaults.colors(
                    focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent, disabledIndicatorColor = Color.Transparent,
                    focusedContainerColor = c.surfaceContainerHigh, unfocusedContainerColor = c.surfaceContainerHigh,
                ),
            )
            FilledIconButton({ ShareController.chatSay(msg); msg = "" }, enabled = msg.isNotBlank() && st.running) {
                Icon(Icons.AutoMirrored.Filled.Send, "Send")
            }
        }
    }
    viewing?.let { id -> PhotoDialog(id) { viewing = null } }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun Bubble(r: ChatRow, first: Boolean, last: Boolean, time: String, onPhoto: () -> Unit) {
    val c = MaterialTheme.colorScheme
    val mine = r.host
    var menu by remember { mutableStateOf(false) }
    val tint = if (mine) c.primary else colorFor(r.name)
    val big = RoundedCornerShape(18.dp)
    val shape = if (mine) RoundedCornerShape(18.dp, 18.dp, if (last) 4.dp else 18.dp, 18.dp) else RoundedCornerShape(18.dp, 18.dp, 18.dp, if (last) 4.dp else 18.dp)
    Row(
        Modifier.fillMaxWidth().padding(top = if (first) 8.dp else 0.dp),
        horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start, verticalAlignment = Alignment.Bottom,
    ) {
        if (!mine) {
            if (last) Box(Modifier.size(32.dp).clip(CircleShape).background(tint), contentAlignment = Alignment.Center) {
                Text(r.name.trim().take(1).uppercase().ifEmpty { "?" }, color = Color.White, fontWeight = FontWeight.Bold)
            } else Spacer(Modifier.size(32.dp))
            Spacer(Modifier.size(6.dp))
        }
        Column(horizontalAlignment = if (mine) Alignment.End else Alignment.Start) {
            if (first && !mine) Text(
                r.name + if (r.mgr) "  · manager" else "", color = tint, fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp, modifier = Modifier.padding(start = 6.dp, bottom = 2.dp),
            )
            Box {
                Box(
                    Modifier.widthIn(max = 290.dp).clip(shape)
                        .background(if (mine) c.primary else c.surfaceContainerHigh)
                        .combinedClickable(onClick = { if (r.img) onPhoto() }, onLongClick = { menu = true }),
                ) {
                    if (r.img) ChatPhoto(r.id, Modifier.widthIn(max = 260.dp).padding(3.dp).clip(big))
                    else Text(
                        r.text, Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        color = if (mine) c.onPrimary else c.onSurface, style = MaterialTheme.typography.bodyLarge,
                    )
                }
                DropdownMenu(menu, { menu = false }) {
                    DropdownMenuItem({ Text("Delete for everyone") }, { ShareController.chatDelete(r.id); menu = false })
                }
            }
            if (last) Text(time, color = c.onSurfaceVariant, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
        }
    }
}

/** Decodes a chat picture off the main thread; the server drops old ones, so it may be gone. */
@Composable
private fun ChatPhoto(id: Long, modifier: Modifier, fill: Boolean = false) {
    var bmp by remember(id) { mutableStateOf<ImageBitmap?>(null) }
    var gone by remember(id) { mutableStateOf(false) }
    LaunchedEffect(id) {
        val b = withContext(Dispatchers.Default) {
            ShareController.chatImage(id)?.let { BitmapFactory.decodeByteArray(it, 0, it.size)?.asImageBitmap() }
        }
        if (b == null) gone = true else bmp = b
    }
    val b = bmp
    when {
        b != null -> Image(
            b, "Photo", modifier.then(if (fill) Modifier else Modifier.aspectRatio(b.width.toFloat() / b.height.toFloat())),
            contentScale = if (fill) ContentScale.Fit else ContentScale.Crop,
        )
        gone -> Text("Photo no longer available", modifier.padding(12.dp), color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        else -> Box(modifier.size(180.dp, 120.dp).background(MaterialTheme.colorScheme.surfaceContainerHighest))
    }
}

@Composable
private fun PhotoDialog(id: Long, onClose: () -> Unit) {
    Dialog(onClose) {
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color.Black).clickable { onClose() }, contentAlignment = Alignment.Center) {
            ChatPhoto(id, Modifier.fillMaxWidth(), fill = true)
        }
    }
}
