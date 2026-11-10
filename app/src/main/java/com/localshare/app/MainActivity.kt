package com.localshare.app

import com.localshare.app.ui.Button
import com.localshare.app.ui.OutlinedButton
import com.localshare.app.ui.TextButton
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.animateFloat
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.localshare.app.ui.LocalShareTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ShareController.init(this)
        handle(intent)
        setContent { LocalShareTheme { App() } }
    }

    override fun onStart() {
        super.onStart()
        ShareController.visible = true
        ShareController.refresh()
    }

    override fun onStop() {
        ShareController.visible = false
        super.onStop()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handle(intent)
    }

    /** Home-screen shortcuts and the Quick Settings tile arrive here. */
    private fun handle(i: Intent?) {
        when (i?.action) {
            ACTION_START -> if (!ShareController.state.value.running) ShareService.start(this)
            ACTION_STOP_SHARE -> ShareService.stop(this)
            ACTION_GAME -> { if (!ShareController.state.value.running) ShareService.start(this); launchAction = ACTION_GAME }
        }
        i?.action = null
    }

    companion object {
        const val ACTION_START = "com.localshare.app.START"
        const val ACTION_STOP_SHARE = "com.localshare.app.STOP_SHARE"
        const val ACTION_GAME = "com.localshare.app.GAME"
        var launchAction by mutableStateOf<String?>(null)
    }
}

@Composable
private fun App() {
    val st by ShareController.state.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var browser by rememberSaveable { mutableStateOf<String?>(null) } // null = closed, "" = files and game, "play" / "obs" = straight into the game

    var joinUrl by rememberSaveable { mutableStateOf<String?>(null) } // another phone's share, opened inside this app
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val la = MainActivity.launchAction
    LaunchedEffect(la, st.running) {
        if (la == MainActivity.ACTION_GAME && st.running) { browser = "play"; MainActivity.launchAction = null }
    }
    val castLauncher = androidx.activity.compose.rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
        val d = res.data
        if (res.resultCode == android.app.Activity.RESULT_OK && d != null) CastService.start(ctx, res.resultCode, d)
    }
    val launchCast = {
        val mpm = ctx.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as android.media.projection.MediaProjectionManager
        castLauncher.launch(mpm.createScreenCaptureIntent())
    }
    // sound needs the microphone permission; ask once, and share the screen either way
    val micLauncher = androidx.activity.compose.rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { launchCast() }
    val startCast = {
        val have = androidx.core.content.ContextCompat.checkSelfPermission(ctx, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (have || android.os.Build.VERSION.SDK_INT < 29) launchCast() else micLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
    }
    joinUrl?.let { u ->
        HostBrowser(0, "", "", u) { joinUrl = null }
        return
    }
    val mode = browser
    if (mode != null && st.running) {
        HostBrowser(st.port, st.hostToken, mode) { browser = null }
        return
    }
    val snackState = remember { androidx.compose.material3.SnackbarHostState() }
    LaunchedEffect(Unit) {
        com.localshare.app.ui.Snack.flow.collect { m ->
            snackState.currentSnackbarData?.dismiss()
            val r = snackState.showSnackbar(m.text, "Undo", duration = androidx.compose.material3.SnackbarDuration.Long)
            if (r == androidx.compose.material3.SnackbarResult.ActionPerformed) m.onUndo() else m.onDone()
        }
    }
    val haptic = androidx.compose.ui.platform.LocalHapticFeedback.current
    LaunchedEffect(st.waiting.size) { // a small buzz when someone new asks to join
        if (st.waiting.isNotEmpty()) haptic.performHapticFeedback(androidx.compose.ui.hapticfeedback.HapticFeedbackType.LongPress)
    }
    val setupCtx = androidx.compose.ui.platform.LocalContext.current
    var setup by rememberSaveable { mutableStateOf(setupMode(setupCtx)) } // 1 first launch, 2 a needed setting is off, 0 hidden
    if (setup != 0) SetupFlow(setup) { ShareController.markGuideSeen(); setup = 0 }
    BackHandler(enabled = tab != 0) { tab = 0 } // Back from any other tab goes to Share first
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { androidx.compose.material3.SnackbarHost(snackState) },
        topBar = { if (tab != 0) AppBar(st.running, st.devices.size) }, // the Share tab has its own rail and profile bar
        bottomBar = {
          Column {
            HorizontalDivider(color = MaterialTheme.colorScheme.outline)
            val nav = NavigationBarItemDefaults.colors(
                selectedIconColor = MaterialTheme.colorScheme.primary, selectedTextColor = MaterialTheme.colorScheme.primary,
                indicatorColor = androidx.compose.ui.graphics.Color.Transparent,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant, unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            NavigationBar(containerColor = MaterialTheme.colorScheme.background, tonalElevation = 0.dp) {
                NavigationBarItem(tab == 0, { tab = 0 }, { NavIcon(tab == 0) { Icon(Icons.Filled.Home, null) } }, label = { Text("Share") }, colors = nav)
                NavigationBarItem(tab == 1, { tab = 1 }, { NavIcon(tab == 1) {
                    BadgedBox(badge = { if (st.waiting.isNotEmpty()) Badge { Text("${st.waiting.size}") } else if (st.devices.isNotEmpty()) Badge { Text("${st.devices.size}") } }) { Icon(Icons.Filled.Person, null) }
                } }, label = { Text("Devices") }, colors = nav)
                NavigationBarItem(tab == 2, { tab = 2 }, { NavIcon(tab == 2) { Icon(painterResource(R.drawable.ic_gamepad), null) } }, label = { Text("Game") }, colors = nav)
                NavigationBarItem(tab == 3, { tab = 3 }, { NavIcon(tab == 3) { Icon(Icons.Filled.Info, null) } }, label = { Text("Activity") }, colors = nav)
                NavigationBarItem(tab == 4, { tab = 4 }, { NavIcon(tab == 4) { Icon(Icons.Filled.Settings, null) } }, label = { Text("Settings") }, colors = nav)
            }
          }
        },
    ) { pad ->
        Box(Modifier.padding(pad).consumeWindowInsets(pad).fillMaxSize()) {
            Crossfade(tab, animationSpec = tween(220), label = "tab") { t ->
                when (t) {
                    0 -> HomeScreen(st, { browser = "" }, startCast) { l ->
                        val t = l.trim()
                        joinUrl = if (t.startsWith("http://") || t.startsWith("https://")) t else "http://$t"
                    }
                    1 -> DevicesScreen(st)
                    2 -> GameScreen(st) { browser = it }
                    3 -> ActivityScreen(st)
                    else -> SettingsScreen(st)
                }
            }
        }
    }
}

/** Icons spring a little when their tab is picked. */
@Composable
private fun NavIcon(selected: Boolean, content: @Composable () -> Unit) {
    val s by androidx.compose.animation.core.animateFloatAsState(
        if (selected) 1.2f else 1f, androidx.compose.animation.core.spring(dampingRatio = 0.4f, stiffness = 500f), label = "nav",
    )
    Box(Modifier.graphicsLayer { scaleX = s; scaleY = s }) { content() }
}

/** YouTube-style top bar: logo tile and name on the left, a LIVE pill and settings on the right. */
@Composable
private fun AppBar(running: Boolean, devices: Int) {
    val c = MaterialTheme.colorScheme
    Row(
        Modifier.fillMaxWidth().background(c.background).statusBarsPadding().padding(start = 14.dp, end = 4.dp, top = 6.dp, bottom = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(34.dp).clip(RoundedCornerShape(10.dp)).background(c.primary), contentAlignment = Alignment.Center) {
            com.localshare.app.ui.LogoMark(22.dp, c.onPrimary, running)
        }
        Spacer(Modifier.width(10.dp))
        Text("LocalShare", style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
        Box(
            Modifier.clip(RoundedCornerShape(50)).background(if (running) c.primary else c.surfaceContainerHigh).padding(horizontal = 12.dp, vertical = 6.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (running) {
                    val pulse by androidx.compose.animation.core.rememberInfiniteTransition(label = "live").animateFloat(
                        0.25f, 1f,
                        androidx.compose.animation.core.infiniteRepeatable(androidx.compose.animation.core.tween(900), androidx.compose.animation.core.RepeatMode.Reverse), label = "dot",
                    )
                    Box(Modifier.size(8.dp).clip(androidx.compose.foundation.shape.CircleShape).background(c.onPrimary.copy(alpha = pulse)))
                    Spacer(Modifier.width(6.dp))
                }
                Text(
                    if (running) "LIVE · $devices" else "OFF", fontWeight = FontWeight.Bold,
                    color = if (running) c.onPrimary else c.onSurfaceVariant, style = MaterialTheme.typography.labelMedium,
                )
            }
        }
        Spacer(Modifier.width(10.dp))
    }
}

/** The host sees the same page guests see, signed in automatically from this phone. */
@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun HostBrowser(port: Int, token: String, mode: String, url: String? = null, onClose: () -> Unit) {
    var web by remember { mutableStateOf<WebView?>(null) }
    // lets the host page's Upload button and profile picture chooser open Android's file picker
    var pending by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    val chooser = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
        pending?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res.resultCode, res.data))
        pending = null
    }
    BackHandler { web?.takeIf { it.canGoBack() }?.goBack() ?: onClose() }
    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).statusBarsPadding().navigationBarsPadding()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClose, Modifier.heightIn(min = 48.dp)) { Text(if (url != null) "← Back" else "← Back to host") }
            Spacer(Modifier.weight(1f))
            Text(if (url != null) "Guest view" else "You're the host", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(end = 14.dp))
        }
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    setBackgroundColor(0xFF000000.toInt())
                    webViewClient = WebViewClient()
                    webChromeClient = object : WebChromeClient() {
                        override fun onShowFileChooser(w: WebView?, cb: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
                            pending?.onReceiveValue(null)
                            pending = cb
                            return try { chooser.launch(params.createIntent()); true } catch (e: Exception) { pending = null; cb.onReceiveValue(null); false }
                        }
                    }
                    setDownloadListener { url, agent, disposition, mime, _ -> download(ctx, url, agent, disposition, mime) }
                    loadUrl(url ?: ("http://127.0.0.1:$port/#ht=$token" + if (mode.isEmpty()) "" else "&g=$mode"))
                    web = this
                }
            },
            onRelease = { it.destroy(); web = null },
        )
    }
}

private fun download(ctx: Context, url: String, agent: String?, disposition: String?, mime: String?) {
    try {
        val req = DownloadManager.Request(Uri.parse(url))
            .setMimeType(mime)
            .addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url) ?: "")
            .addRequestHeader("User-Agent", agent ?: "")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, disposition, mime))
        (ctx.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
        Toast.makeText(ctx, "Downloading to your Downloads folder", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
        Toast.makeText(ctx, "Could not start the download", Toast.LENGTH_SHORT).show()
    }
}
