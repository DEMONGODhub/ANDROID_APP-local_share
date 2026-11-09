package com.localshare.app

import android.content.Context
import com.localshare.app.server.ServerConfig

class Prefs(ctx: Context) {
    private val sp = ctx.getSharedPreferences("localshare", Context.MODE_PRIVATE)

    /** Shared folders (tree URIs), in the order they were added. */
    var folders: List<String>
        get() {
            val saved = (sp.getString("folders", null) ?: "").lines().filter { it.isNotBlank() }
            val legacy = sp.getString("folder", null)
            return if (saved.isEmpty() && legacy != null) listOf(legacy) else saved
        }
        set(v) = sp.edit().putString("folders", v.joinToString("\n")).remove("folder").apply()

    var allowUploads: Boolean
        get() = sp.getBoolean("uploads", false)
        set(v) = sp.edit().putBoolean("uploads", v).apply()

    var allowDelete: Boolean
        get() = sp.getBoolean("delete", false)
        set(v) = sp.edit().putBoolean("delete", v).apply()

    /** How long a guest stays signed in, in hours; 0 means until the host stops sharing. */
    var sessionHours: Int
        get() = sp.getInt("session_h", 6)
        set(v) = sp.edit().putInt("session_h", v).apply()

    var password: String
        get() = sp.getString("password", "") ?: ""
        set(v) = sp.edit().putString("password", v).apply()

    var maxClients: Int
        get() = sp.getInt("max", 5)
        set(v) = sp.edit().putInt("max", v).apply()

    var port: Int
        get() = sp.getInt("port", 8080)
        set(v) = sp.edit().putInt("port", v).apply()

    /** Wi-Fi details the host chose to show as a QR code, so friends can join the network with one scan. */
    var wifiSsid: String
        get() = sp.getString("wifi_ssid", "") ?: ""
        set(v) = sp.edit().putString("wifi_ssid", v).apply()

    var wifiPass: String
        get() = sp.getString("wifi_pass", "") ?: ""
        set(v) = sp.edit().putString("wifi_pass", v).apply()

    /** Also send the microphone with the screen sound. */
    var castMic: Boolean
        get() = sp.getBoolean("cast_mic", false)
        set(v) = sp.edit().putBoolean("cast_mic", v).apply()

    /** Guests may press the TV remote on the web page. */
    var remoteOn: Boolean
        get() = sp.getBoolean("remote_on", false)
        set(v) = sp.edit().putBoolean("remote_on", v).apply()

    /** Custom colours the host saved with the + tile (hex codes, newest first, up to 12). */
    var savedAccents: String
        get() = sp.getString("savedAccents", "") ?: ""
        set(v) = sp.edit().putString("savedAccents", v).apply()
    var savedIcons: String
        get() = sp.getString("savedIcons", "") ?: ""
        set(v) = sp.edit().putString("savedIcons", v).apply()

    /** The first-run guide has been shown. */
    var guideSeen: Boolean
        get() = sp.getBoolean("guideSeen", false)
        set(v) = sp.edit().putBoolean("guideSeen", v).apply()

    /** Accent colour as #RRGGBB (default yellow). */
    var accent: String
        get() = sp.getString("accent", "#FFD60A") ?: "#FFD60A"
        set(v) = sp.edit().putString("accent", v).apply()

    /** The host's name as guests see it. */
    var hostName: String
        get() = sp.getString("host_name", "Host") ?: "Host"
        set(v) = sp.edit().putString("host_name", v).apply()

    /** "logo:N" for a built-in logo, or "photo". The picture itself is kept as a file. */
    var hostPicKind: String
        get() = sp.getString("host_pic", "logo:0") ?: "logo:0"
        set(v) = sp.edit().putString("host_pic", v).apply()

    /** Use the old picture-by-picture stream (for very old browsers). The default hardware video is smoother and cooler. */
    var castCompat: Boolean
        get() = sp.getBoolean("cast_compat", false)
        set(v) = sp.edit().putBoolean("cast_compat", v).apply()

    /** Ask me before a new device is let in. */
    var askToJoin: Boolean
        get() = sp.getBoolean("ask_join", false)
        set(v) = sp.edit().putBoolean("ask_join", v).apply()

    /** Game-only hosting: nobody but the host can see any file. */
    var gameOnly: Boolean
        get() = sp.getBoolean("game_only", false)
        set(v) = sp.edit().putBoolean("game_only", v).apply()

    fun loadPerms(): Map<String, Int> =
        (sp.getString("perms", "") ?: "").lines().mapNotNull {
            val p = it.split('\t')
            val v = p.getOrNull(1)?.toIntOrNull()
            if (p.size == 2 && v != null) p[0] to v else null
        }.toMap()

    fun savePerms(m: Map<String, Int>) {
        sp.edit().putString("perms", m.entries.joinToString("\n") { "${it.key}\t${it.value}" }).apply()
    }

    /** 0 = PvP, 1 = Battle Royale. */
    var gameMode: Int
        get() = sp.getInt("game_mode", 0)
        set(v) = sp.edit().putInt("game_mode", v).apply()

    /** Game rules (teams, shots, bots, zone speed, health) and the saved hall of fame. */
    var gameRules: String
        get() = sp.getString("game_rules", "") ?: ""
        set(v) = sp.edit().putString("game_rules", v).apply()

    var hall: String
        get() = sp.getString("hall", "") ?: ""
        set(v) = sp.edit().putString("hall", v).apply()

    var gameEnabled: Boolean
        get() = sp.getBoolean("game", true)
        set(v) = sp.edit().putBoolean("game", v).apply()

    fun loadBlocks(): List<ServerConfig.Block> =
        (sp.getString("blocks", "") ?: "").lines().mapNotNull {
            val p = it.split('\t')
            if (p.size == 4) ServerConfig.Block(p[0], p[1], p[2], p[3]) else null
        }

    fun saveBlocks(list: List<ServerConfig.Block>) {
        sp.edit().putString("blocks", list.joinToString("\n") { "${it.id}\t${it.name}\t${it.ip}\t${it.device}" }).apply()
    }
}
