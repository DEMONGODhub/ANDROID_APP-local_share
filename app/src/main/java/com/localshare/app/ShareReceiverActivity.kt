package com.localshare.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.localshare.app.ui.LocalShareTheme
import com.localshare.app.ui.TextButton

/** "Share" from any app lands here: pick a nearby LocalShare phone, or put text on this phone's board. */
class ShareReceiverActivity : ComponentActivity() {
    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ShareController.init(this)
        Nearby.start(this)
        val i = intent
        val text = i.getStringExtra(Intent.EXTRA_TEXT)
        val uris: List<Uri> = when (i.action) {
            Intent.ACTION_SEND -> listOfNotNull(if (Build.VERSION.SDK_INT >= 33) i.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java) else i.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))
            Intent.ACTION_SEND_MULTIPLE -> (if (Build.VERSION.SDK_INT >= 33) i.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri::class.java) else i.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)) ?: emptyList()
            else -> emptyList()
        }
        if (uris.isEmpty() && text.isNullOrBlank()) { finish(); return }
        setContent {
            LocalShareTheme {
                var pw by remember { mutableStateOf("") }
                var status by remember { mutableStateOf("") }
                var busy by remember { mutableStateOf(false) }
                val mine = ShareController.state.value.urls
                val peers = Nearby.peers.filter { p -> mine.none { it.startsWith(p.url) } }
                val run = { url: String ->
                    busy = true
                    Thread {
                        val r = if (uris.isNotEmpty()) PeerSender.sendFiles(this, url, pw, uris) { s -> runOnUiThread { status = s } } else PeerSender.sendText(this, url, pw, text.orEmpty())
                        runOnUiThread { status = r; busy = false }
                    }.start()
                }
                AlertDialog(
                    onDismissRequest = { if (!busy) finish() },
                    title = { Text(if (uris.isNotEmpty()) "Send ${uris.size} ${if (uris.size == 1) "file" else "files"} to…" else "Share this text with…") },
                    text = {
                        Column {
                            if (status.isNotEmpty()) Text(status, Modifier.padding(bottom = 8.dp))
                            if (peers.isEmpty()) Text("Looking for phones with LocalShare on this Wi-Fi…")
                            peers.forEach { p -> TextButton({ if (!busy) run(p.url) }, Modifier.fillMaxWidth()) { Text(p.name) } }
                            if (uris.isEmpty() && ShareController.state.value.running) TextButton({ ShareController.addClip(text.orEmpty()); status = "Added to the shared board"; }, Modifier.fillMaxWidth()) { Text("My shared board") }
                            OutlinedTextField(pw, { pw = it }, singleLine = true, label = { Text("Their password, if they set one") })
                        }
                    },
                    confirmButton = { TextButton({ finish() }, enabled = !busy) { Text("Close") } },
                )
            }
        }
    }
}
