package com.localshare.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/** The side panel: brand, LIVE state and the five sections. Permanent on wide screens, a drawer on phones. */
@Composable
internal fun SidePanel(tab: Int, running: Boolean, devices: Int, waiting: Int, pick: (Int) -> Unit, onHost: () -> Unit, onJoin: () -> Unit) {
    val c = MaterialTheme.colorScheme
    Column(
        Modifier.width(300.dp).fillMaxHeight().background(c.surface)
            .statusBarsPadding().navigationBarsPadding().verticalScroll(rememberScrollState()).padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(Modifier.padding(start = 6.dp, top = 4.dp, bottom = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(38.dp).clip(RoundedCornerShape(12.dp)).background(c.primary), contentAlignment = Alignment.Center) {
                com.localshare.app.ui.LogoMark(24.dp, c.onPrimary, running)
            }
            Spacer(Modifier.width(12.dp))
            Column {
                Text("LocalShare", style = MaterialTheme.typography.titleLarge)
                Text(if (running) "LIVE · $devices connected" else "Not sharing", style = MaterialTheme.typography.bodySmall, color = if (running) c.primary else c.onSurfaceVariant)
            }
        }
        val colors = androidx.compose.material3.NavigationDrawerItemDefaults.colors(
            selectedContainerColor = c.surfaceContainerHigh, unselectedContainerColor = Color.Transparent,
            selectedIconColor = c.primary, selectedTextColor = c.primary,
            unselectedIconColor = c.onSurfaceVariant, unselectedTextColor = c.onSurface,
        )
        listOf(R.string.nav_share, R.string.nav_devices, R.string.nav_game, R.string.nav_activity, R.string.nav_settings).forEachIndexed { i, labelRes ->
            val label = androidx.compose.ui.res.stringResource(labelRes)
            androidx.compose.material3.NavigationDrawerItem(
                label = { Text(label, fontWeight = FontWeight.SemiBold) }, selected = tab == i, onClick = { pick(i) },
                icon = {
                    when (i) {
                        0 -> Icon(Icons.Filled.Home, null)
                        1 -> BadgedBox(badge = { if (waiting > 0) Badge { Text("$waiting") } }) { Icon(Icons.Filled.Person, null) }
                        2 -> Icon(painterResource(R.drawable.ic_gamepad), null)
                        3 -> Icon(Icons.Filled.Info, null)
                        else -> Icon(Icons.Filled.Settings, null)
                    }
                },
                colors = colors, shape = RoundedCornerShape(14.dp),
            )
        }
        androidx.compose.material3.HorizontalDivider(Modifier.padding(vertical = 8.dp), color = c.outlineVariant)
        androidx.compose.material3.NavigationDrawerItem(
            label = { Text(androidx.compose.ui.res.stringResource(R.string.nav_host), fontWeight = FontWeight.SemiBold) },
            selected = false, onClick = onHost, icon = { Icon(Icons.Filled.Home, null) },
            badge = { if (!running) Text(androidx.compose.ui.res.stringResource(R.string.nav_host_off), style = MaterialTheme.typography.labelSmall, color = c.onSurfaceVariant) },
            colors = colors, shape = RoundedCornerShape(14.dp),
        )
        androidx.compose.material3.NavigationDrawerItem(
            label = { Text(androidx.compose.ui.res.stringResource(R.string.nav_join), fontWeight = FontWeight.SemiBold) },
            selected = false, onClick = onJoin, icon = { Icon(Icons.Filled.Person, null) },
            colors = colors, shape = RoundedCornerShape(14.dp),
        )
    }
}

/** Ask for a friend's address and open their share inside the app. */
@Composable
internal fun JoinDialog(onDismiss: () -> Unit, onGo: (String) -> Unit) {
    var v by androidx.compose.runtime.saveable.rememberSaveable { androidx.compose.runtime.mutableStateOf("") }
    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(androidx.compose.ui.res.stringResource(R.string.nav_join)) },
        text = {
            androidx.compose.material3.OutlinedTextField(
                v, { v = it }, singleLine = true,
                label = { Text(androidx.compose.ui.res.stringResource(R.string.join_hint)) },
            )
        },
        confirmButton = { androidx.compose.material3.TextButton({ if (v.isNotBlank()) onGo(v) }) { Text(androidx.compose.ui.res.stringResource(R.string.join_go)) } },
        dismissButton = { androidx.compose.material3.TextButton(onDismiss) { Text(androidx.compose.ui.res.stringResource(android.R.string.cancel)) } },
    )
}
