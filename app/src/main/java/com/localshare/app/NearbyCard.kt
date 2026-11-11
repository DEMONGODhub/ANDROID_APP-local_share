package com.localshare.app

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
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
import androidx.compose.ui.unit.dp
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import com.localshare.app.ui.Button
import com.localshare.app.ui.OutlinedButton
import com.localshare.app.ui.SectionCard
import com.localshare.app.ui.pressFeel

/** Phones with LocalShare on the same Wi-Fi or hotspot, phones joined before, and a scanner for another phone's QR code. */
@OptIn(ExperimentalFoundationApi::class)
@Composable
internal fun NearbyCard(st: UiState, onJoin: (String) -> Unit) {
    val ctx = LocalContext.current
    DisposableEffect(Unit) { Nearby.start(ctx); onDispose { Nearby.stop() } }
    var note by remember { mutableStateOf("") }
    var friends by remember { mutableStateOf(ShareController.friends()) }
    val mine = st.urls
    val found = Nearby.peers.filter { p -> mine.none { it.startsWith(p.url) } }
    fun open(name: String, url: String) { ShareController.rememberFriend(name, url); friends = ShareController.friends(); onJoin(url) }

    SectionCard {
        Text("Phones nearby", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(
            "Other phones with LocalShare on this Wi-Fi or hotspot show up here while they are sharing. Tap one to open its files, chat, games and screen.",
            color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall,
        )
        if (found.isEmpty()) Text("Looking for phones…", color = MaterialTheme.colorScheme.onSurfaceVariant)
        found.forEach { p -> PhoneRow(p.name, p.url, "Nearby now") { open(p.name, p.url) } }
        OutlinedButton({
            note = ""
            try {
                GmsBarcodeScanning.getClient(ctx, GmsBarcodeScannerOptions.Builder().setBarcodeFormats(Barcode.FORMAT_QR_CODE).build()).startScan()
                    .addOnSuccessListener { b ->
                        val t = b.rawValue.orEmpty().trim()
                        if (t.startsWith("http://") || t.startsWith("https://")) open(t.substringAfter("//").substringBefore("/").substringBefore(":"), t)
                        else note = "That code is not a LocalShare address."
                    }
                    .addOnFailureListener { note = "Could not open the scanner. Check your internet once so Google Play services can load it, or type the link below." }
            } catch (e: Exception) { note = "The scanner is not available on this phone. Type the link instead." }
        }, Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Text("Scan another phone's code") }
        Text("On the other phone, open Connect and show the QR code from Invite.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        if (note.isNotEmpty()) Text(note, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
    }
    if (friends.isNotEmpty()) SectionCard {
        Text("Joined before", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        friends.forEach { (n, u) ->
            PhoneRow(n, u, "Hold to forget", onLong = { ShareController.forgetFriend(u); friends = ShareController.friends() }) { open(n, u) }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PhoneRow(name: String, url: String, sub: String, onLong: (() -> Unit)? = null, onClick: () -> Unit) {
    val c = MaterialTheme.colorScheme
    Row(
        Modifier.fillMaxWidth().clip(MaterialTheme.shapes.medium).background(c.surfaceContainerHighest).pressFeel(haptic = true)
            .combinedClickable(onLongClick = onLong, onClick = onClick).heightIn(min = 56.dp).padding(horizontal = 12.dp)
            .semantics { contentDescription = "Open $name, $sub" },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(36.dp).clip(CircleShape).background(c.primary), contentAlignment = Alignment.Center) {
            Text(name.firstOrNull()?.uppercase() ?: "?", color = c.onPrimary, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(name, fontWeight = FontWeight.SemiBold, maxLines = 1)
            Text(url.removePrefix("http://"), color = c.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, maxLines = 1)
        }
        Text("Open", color = c.primary, fontWeight = FontWeight.SemiBold)
    }
}
