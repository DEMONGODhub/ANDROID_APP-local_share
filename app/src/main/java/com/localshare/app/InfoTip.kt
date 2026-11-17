package com.localshare.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.Alignment
import androidx.compose.material.icons.filled.Info

/** A small (i). Tap it to read what the card does, so the screen itself stays clean. */
@Composable
internal fun Info(text: String, modifier: Modifier = Modifier) {
    var open by remember { mutableStateOf(false) }
    IconButton({ open = true }, modifier.size(40.dp)) {
        Icon(Icons.Filled.Info, "What is this?", Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
    }
    if (open) AlertDialog(
        onDismissRequest = { open = false },
        text = { Text(text) },
        confirmButton = { TextButton({ open = false }) { Text("Got it") } },
    )
}

/** Lone (i) on its own line, pushed to the right edge of the card. */
@Composable
internal fun InfoRow(text: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) { Info(text) }
}

/** A card heading with its (i) right next to it, so every tab lines up the same way. */
@Composable
internal fun TitleRow(title: String, info: String, big: Boolean = false) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            title, Modifier.weight(1f).semantics { heading() },
            style = if (big) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyLarge,
            fontWeight = if (big) FontWeight.Bold else FontWeight.SemiBold,
        )
        Info(info)
    }
}
