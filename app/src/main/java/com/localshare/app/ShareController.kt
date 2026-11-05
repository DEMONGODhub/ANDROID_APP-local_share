package com.localshare.app

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.documentfile.provider.DocumentFile
import com.localshare.app.server.AssetProvider
import com.localshare.app.server.CompositeFileSource
import com.localshare.app.server.FileSource
import com.localshare.app.server.MiniServer
import com.localshare.app.server.ServerConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.net.Inet4Address
import java.net.NetworkInterface
import java.util.Collections

data class Device(val id: String, val name: String, val ip: String, val since: Long, val perms: Int = 0) {
    val manager get() = perms and 64 != 0
}
data class SharedFolder(val uri: String, val name: String)
data class BlockedDevice(val id: String, val name: String, val ip: String)
data class LogLine(val time: Long, val kind: String, val who: String, val detail: String)

/** How much the shared folders hold, against the phone's own storage. */
data class StorageInfo(val sharedBytes: Long = 0, val files: Int = 0, val folders: Int = 0, val total: Long = 0, val free: Long = 0, val counting: Boolean = false, val partial: Boolean = false)

data class ChatRow(val name: String, val text: String, val host: Boolean)

data class InviteInfo(val token: String, val expires: Long, val uses: Int)

data class GameRules(val teams: Boolean = false, val shots: Boolean = true, val bots: Int = 1, val zone: Int = 1, val health: Int = 1)

data class HallRow(val name: String, val best: Int, val kills: Int, val wins: Int)

data class UiState(
    val running: Boolean = false,
    val port: Int = 8080,
    val urls: List<String> = emptyList(),
    val hostToken: String = "",
    val folders: List<SharedFolder> = emptyList(),
    val devices: List<Device> = emptyList(),
    /** Devices waiting for the host to let them in. */
    val waiting: List<Device> = emptyList(),
    val askToJoin: Boolean = false,
    val casting: Boolean = false,
    val viewers: Int = 0,
    val castSince: Long = 0,
    val castSilent: Boolean = false,
    val castMic: Boolean = false,
    val castCompat: Boolean = false,
    val hostName: String = "Host",
    val hostPicVer: Int = 0,
    val hostPicKind: String = "logo:0",
    /** Live line for the screen card: "720p · 30 fps · 2.6 Mbps · 36 °C · battery 71% (-6%/h)". Empty when not casting. */
    val castMeter: String = "",
    val castNote: String = "",
    val storage: StorageInfo = StorageInfo(),
    val invites: List<InviteInfo> = emptyList(),
    val chat: List<ChatRow> = emptyList(),
    val chatSlow: Int = 0,
    val wifiSsid: String = "",
    val wifiPass: String = "",
    val blocks: List<BlockedDevice> = emptyList(),
    val log: List<LogLine> = emptyList(),
    val password: String = "",
    val maxClients: Int = 5,
    val gameEnabled: Boolean = true,
    val allowUploads: Boolean = false,
    val remoteOn: Boolean = false,
    val allowDelete: Boolean = false,
    val gameOnly: Boolean = false,
    val gameMode: Int = 0,
    val rules: GameRules = GameRules(),
    val hall: List<HallRow> = emptyList(),
    val sessionHours: Int = 6,
    val error: String? = null,
)

/** Single source of truth shared by the UI and the foreground service. */
object ShareController {
    private lateinit var app: Context
    private lateinit var prefs: Prefs
    private val cfg = ServerConfig()
    private var server: MiniServer? = null
    private val main = Handler(Looper.getMainLooper())
    private val _state = MutableStateFlow(UiState())
    val state: StateFlow<UiState> get() = _state
    private var ready = false
    @Volatile private var storage = StorageInfo()
    @Volatile private var measuring = false

    private val ticker = object : Runnable {
        override fun run() {
            refresh()
            if (server != null) main.postDelayed(this, 2000)
        }
    }

    fun init(ctx: Context) {
        if (ready) return
        ready = true
        app = ctx.applicationContext
        prefs = Prefs(app)
        cfg.password = prefs.password
        cfg.maxClients = prefs.maxClients
        cfg.gameEnabled = prefs.gameEnabled
        cfg.allowUploads = prefs.allowUploads
        cfg.remote = prefs.remoteOn
        loadHost()
        cfg.allowDelete = prefs.allowDelete
        cfg.gameOnly = prefs.gameOnly
        cfg.askToJoin = prefs.askToJoin
        cfg.gameMode = prefs.gameMode
        cfg.loadRules(prefs.gameRules)
        cfg.loadRecords(prefs.hall)
        cfg.gameEnabled = prefs.gameEnabled || prefs.gameOnly
        cfg.loadPerms(prefs.loadPerms())
        cfg.sessionMs = prefs.sessionHours * 3600000L
        cfg.setBlocks(prefs.loadBlocks())
        cfg.onChange = Runnable { prefs.saveBlocks(cfg.blocks()); prefs.savePerms(cfg.permsSnapshot()); prefs.gameMode = cfg.gameMode; prefs.gameRules = cfg.rulesText(); prefs.hall = cfg.recordsText(); refresh() }
        refresh()
    }

    // ---- settings (applied live to the running server) ----
    fun setPassword(v: String) { prefs.password = v; cfg.password = v; server?.kickAll(); refresh() }
    fun setMaxClients(v: Int) { prefs.maxClients = v; cfg.maxClients = v; refresh() }
    fun setGame(v: Boolean) { prefs.gameEnabled = v; cfg.gameEnabled = v || prefs.gameOnly; refresh() }
    /** Game-only hosting needs no folders: guests only ever see the game. */
    fun setGameOnly(v: Boolean) { prefs.gameOnly = v; cfg.gameOnly = v; cfg.gameEnabled = prefs.gameEnabled || v; refresh() }
    fun setGameMode(m: Int) { cfg.setGameMode(m) }
    fun setRule(k: String, v: Int) { cfg.setRule(k, v) }
    fun clearHall() { cfg.clearRecords() }
    private fun hallRows(): List<HallRow> = try {
        val a = org.json.JSONArray(cfg.hallJson(10))
        (0 until a.length()).map { val r = a.getJSONArray(it); HallRow(r.getString(0), r.getInt(1), r.getInt(2), r.getInt(3)) }
    } catch (e: Exception) { emptyList() }
    fun setAskToJoin(v: Boolean) { prefs.askToJoin = v; cfg.askToJoin = v; refresh() }
    /** The host (or a manager) lets a waiting device in, or turns it away. */
    fun approve(id: String, allow: Boolean): Boolean { val ok = server?.approve(id, allow) ?: true; refresh(); return ok }
    fun setManager(id: String, on: Boolean) { server?.setManager(id, on); refresh() }
    /** A link that lets someone in without the password until it runs out; uses < 0 means anyone who has it. */
    fun createInvite(hours: Int, uses: Int) { cfg.createInvite(hours * 3600000L, uses); refresh() }
    fun revokeInvite(token: String) { cfg.revokeInvite(token); refresh() }
    fun setWifi(ssid: String, pass: String) { prefs.wifiSsid = ssid; prefs.wifiPass = pass; refresh() }
    fun setCastMic(v: Boolean) { prefs.castMic = v; refresh() }
    fun setCastCompat(v: Boolean) { prefs.castCompat = v; refresh() }

    // ---- the host's profile: a name and a picture (a built-in logo or a photo), shown to guests who joined ----
    @Volatile private var hostBmp: android.graphics.Bitmap? = null
    fun hostBitmap(): android.graphics.Bitmap? = hostBmp

    private fun loadHost() {
        val f = java.io.File(app.filesDir, "host_pic.png")
        var bytes: ByteArray? = try { if (f.exists()) f.readBytes() else null } catch (e: Exception) { null }
        if (bytes == null) { // first start: the app's own logo
            bytes = HostProfile.png(HostProfile.logoBitmap(0))
            try { f.writeBytes(bytes) } catch (e: Exception) { }
        }
        hostBmp = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        cfg.setHostProfile(prefs.hostName, bytes)
    }

    fun setHostName(n: String) { prefs.hostName = n.trim().take(24).ifEmpty { "Host" }; cfg.setHostProfile(prefs.hostName, null); refresh() }
    fun setHostLogo(kind: Int) = saveHostPic(HostProfile.logoBitmap(kind), "logo:$kind")
    fun setHostPhoto(uri: android.net.Uri) { HostProfile.photoBitmap(app, uri)?.let { saveHostPic(it, "photo") } }

    private fun saveHostPic(b: android.graphics.Bitmap, kind: String) {
        val bytes = HostProfile.png(b)
        try { java.io.File(app.filesDir, "host_pic.png").writeBytes(bytes) } catch (e: Exception) { }
        prefs.hostPicKind = kind
        hostBmp = b
        cfg.setHostProfile(prefs.hostName, bytes)
        refresh()
    }

    private fun meter(ctx: Context, s: com.localshare.app.server.StreamHub?): String {
        if (!CastService.active || s == null) return ""
        val b = CastService.battery(ctx)
        val hrs = (System.currentTimeMillis() - CastService.startMs) / 3_600_000.0
        val drop = CastService.startPct - b[0]
        val drain = if (hrs >= 0.1 && CastService.startPct >= 0 && b[0] >= 0 && b[1] == 0) " (-" + Math.round(maxOf(0, drop) / hrs) + "%/h)" else ""
        val vid = if (CastService.jpegMode || s.videoHeight() == 0) "Compatibility stream" else minOf(s.videoWidth(), s.videoHeight()).toString() + "p"
        val rate = if (s.kbps() > 0) " · " + String.format(java.util.Locale.US, "%.1f", s.kbps() / 1000.0) + " Mbps" else ""
        val heat = if (b[2] > 0) " · " + (b[2] / 10) + " °C" else ""
        val bat = if (b[0] >= 0) " · battery " + b[0] + "%" + (if (b[1] == 1) " (charging)" else drain) else ""
        return vid + rate + heat + bat
    }
    fun chatSay(text: String) { server?.hostSay(text); refresh() }
    fun setChatSlow(sec: Int) { server?.setChatSlow(sec); refresh() }
    fun streamHub() = server?.stream()
    fun setOnStopStream(r: () -> Unit) { server?.setOnStopStream(Runnable(r)) }
    fun setDevicePerms(id: String, perms: Int) { server?.setPerms(id, perms); refresh() }
    fun setPort(v: Int) { prefs.port = v; refresh() }
    fun setRemote(v: Boolean) { prefs.remoteOn = v; cfg.remote = v; refresh() }
    fun setUploads(v: Boolean) { prefs.allowUploads = v; cfg.allowUploads = v; refresh() }
    fun setDelete(v: Boolean) { prefs.allowDelete = v; cfg.allowDelete = v; refresh() }
    fun setSessionHours(v: Int) { prefs.sessionHours = v; cfg.sessionMs = v * 3600000L; refresh() }
    fun clearLog() { cfg.log.clear(); refresh() }

    fun addFolder(uri: Uri) {
        val s = uri.toString()
        if (s in prefs.folders) return
        prefs.folders = prefs.folders + s
        applyFolders()
    }

    fun removeFolder(uri: String) {
        prefs.folders = prefs.folders - uri
        try {
            app.contentResolver.releasePersistableUriPermission(
                Uri.parse(uri), android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION or android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        } catch (e: Exception) { }
        applyFolders()
    }

    private fun applyFolders() {
        server?.setFileSource(buildSource())
        refresh()
        measure()
    }

    private fun folderName(uri: String): String = try {
        DocumentFile.fromTreeUri(app, Uri.parse(uri))?.name
    } catch (e: Exception) { null } ?: "Folder"

    /** Visitors see one entry per shared folder and pick which one to open. */
    private fun buildSource(): FileSource {
        val used = HashSet<String>()
        val mounts = LinkedHashMap<String, FileSource>()
        for (f in prefs.folders) mounts[CompositeFileSource.mountName(folderName(f), used)] = SafFileSource(app, Uri.parse(f))
        return CompositeFileSource(mounts)
    }

    /** Adds up the size of everything shared, off the main thread (stops after 25 s on huge folders and says so). */
    fun measure() {
        if (measuring || !ready) return
        measuring = true
        storage = storage.copy(counting = true)
        refresh()
        Thread {
            var bytes = 0L; var files = 0; var dirs = 0; var partial = false
            val deadline = System.currentTimeMillis() + 25000
            try {
                val src = buildSource()
                fun walk(p: List<String>) {
                    if (System.currentTimeMillis() > deadline) { partial = true; return }
                    val list = try { src.list(p) } catch (e: Exception) { null } ?: return
                    for (e in list) if (e.dir) { dirs++; walk(p + e.name) } else { files++; bytes += e.size }
                }
                if (prefs.folders.isNotEmpty()) walk(emptyList())
            } catch (e: Exception) { }
            var total = 0L; var free = 0L
            try {
                val st = android.os.StatFs(android.os.Environment.getDataDirectory().path)
                total = st.totalBytes; free = st.availableBytes
            } catch (e: Exception) { }
            main.post {
                storage = StorageInfo(bytes, files, dirs, total, free, counting = false, partial = partial)
                measuring = false
                refresh()
            }
        }.start()
    }

    fun deviceGameOk(): Boolean = prefs.gameEnabled || prefs.gameOnly

    fun gameRoster(): String = server?.gameRoster() ?: "[]"
    fun setSpectator(id: String, on: Boolean) { server?.setSpectator(id, on) }
    fun givePower(id: String, power: String): Int = server?.grantPower(id, power) ?: 0
    fun kick(id: String) { server?.kick(id); refresh() }
    fun block(id: String) { server?.block(id); refresh() }
    fun unblock(id: String) { cfg.removeBlock(id); refresh() }

    // ---- lifecycle (called by ShareService) ----
    /** @return null on success, otherwise a human-readable error */
    @Synchronized
    fun start(): String? {
        if (server != null) return null
        if (prefs.folders.isEmpty() && !prefs.gameOnly) return "Add a folder first, or turn on game-only mode"
        return try {
            val s = MiniServer(cfg, buildSource(), AssetProvider { name ->
                try { app.assets.open("web/$name").use { it.readBytes() } } catch (e: java.io.IOException) { null }
            })
            s.start(prefs.port)
            server = s
            main.post(ticker)
            null
        } catch (e: Exception) {
            val msg = "Could not start on port ${prefs.port}: ${e.message}"
            _state.value = _state.value.copy(error = msg)
            msg
        }
    }

    @Synchronized
    fun stop() {
        CastService.stop(app)
        server?.stop()
        server = null
        main.removeCallbacks(ticker)
        refresh()
    }

    fun isRunning() = server != null

    fun refresh() {
        val s = server
        val ips = if (s != null) localIps() else emptyList()
        _state.value = UiState(
            running = s != null,
            port = s?.port() ?: prefs.port,
            urls = ips.map { "http://$it:${s?.port()}" },
            hostToken = s?.hostToken() ?: "",
            folders = prefs.folders.map { SharedFolder(it, folderName(it)) },
            devices = s?.sessions()?.filter { !it.pending }?.map { Device(it.id, it.name, it.ip, it.since, it.perms) } ?: emptyList(),
            waiting = s?.sessions()?.filter { it.pending }?.map { Device(it.id, it.name, it.ip, it.since, it.perms) } ?: emptyList(),
            askToJoin = cfg.askToJoin,
            casting = CastService.active && s != null,
            viewers = s?.stream()?.viewers() ?: 0,
            castSilent = CastService.active && CastService.silent,
            castMic = prefs.castMic,
            castCompat = prefs.castCompat,
            hostName = prefs.hostName,
            hostPicVer = cfg.hostPicVer,
            hostPicKind = prefs.hostPicKind,
            castMeter = meter(app, s?.stream()),
            castNote = if (CastService.active) s?.stream()?.note() ?: "" else "",
            castSince = if (CastService.active) s?.stream()?.startedAt() ?: 0L else 0L,
            storage = storage,
            chat = s?.chatRecent(12)?.map { ChatRow(it[0], it[1], it[2] == "1") } ?: emptyList(),
            chatSlow = s?.chatSlow() ?: 0,
            invites = if (s != null) cfg.activeInvites().map { InviteInfo(it.token, it.expires, it.uses) } else emptyList(),
            wifiSsid = prefs.wifiSsid,
            wifiPass = prefs.wifiPass,
            blocks = cfg.blocks().map { BlockedDevice(it.id, it.name, it.ip) },
            log = if (s != null) cfg.log.recent().take(100).map { LogLine(it.time, it.kind, it.who, it.detail) } else emptyList(),
            password = cfg.password,
            maxClients = cfg.maxClients,
            gameEnabled = cfg.gameEnabled,
            allowUploads = cfg.allowUploads,
            remoteOn = cfg.remote,
            allowDelete = cfg.allowDelete,
            gameOnly = cfg.gameOnly,
            gameMode = cfg.gameMode,
            rules = GameRules(cfg.gameTeams, cfg.gameShots, cfg.gameBots, cfg.gameZone, cfg.gameHealth),
            hall = hallRows(),
            sessionHours = prefs.sessionHours,
            error = _state.value.error.takeIf { s == null },
        )
    }

    /** Private-network IPv4 addresses (Wi-Fi, hotspot, ethernet) — never mobile-data addresses. */
    private fun localIps(): List<String> = try {
        Collections.list(NetworkInterface.getNetworkInterfaces()).filter { it.isUp && !it.isLoopback }
            .flatMap { Collections.list(it.inetAddresses) }
            .filter { it is Inet4Address && it.isSiteLocalAddress }
            .map { it.hostAddress ?: "" }.filter { it.isNotEmpty() }
    } catch (e: Exception) { emptyList() }
}
