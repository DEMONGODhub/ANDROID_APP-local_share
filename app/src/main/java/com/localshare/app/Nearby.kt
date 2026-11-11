package com.localshare.app

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.mutableStateListOf

/** Another LocalShare phone found on this Wi-Fi or hotspot. */
class Peer(val name: String, val url: String)

/** Finds other phones running LocalShare (they announce "_localshare._tcp." from Advertiser). Works on Android 5 and newer. */
object Nearby {
    val peers = mutableStateListOf<Peer>()
    private val main = Handler(Looper.getMainLooper())
    private val queue = java.util.ArrayDeque<NsdServiceInfo>()
    private var nsd: NsdManager? = null
    private var listener: NsdManager.DiscoveryListener? = null
    private var resolving = false

    fun start(ctx: Context) {
        if (listener != null) return
        val m = ctx.applicationContext.getSystemService(Context.NSD_SERVICE) as? NsdManager ?: return
        val l = object : NsdManager.DiscoveryListener {
            override fun onServiceFound(i: NsdServiceInfo) {
                if (!i.serviceType.startsWith("_localshare._tcp")) return
                main.post { queue.add(i); next() }
            }
            override fun onServiceLost(i: NsdServiceInfo) { main.post { peers.removeAll { it.name == label(i.serviceName) } } }
            override fun onDiscoveryStarted(t: String) {}
            override fun onDiscoveryStopped(t: String) {}
            override fun onStartDiscoveryFailed(t: String, e: Int) { main.post { listener = null } }
            override fun onStopDiscoveryFailed(t: String, e: Int) {}
        }
        try { m.discoverServices("_localshare._tcp.", NsdManager.PROTOCOL_DNS_SD, l); nsd = m; listener = l } catch (e: Exception) { }
    }

    fun stop() {
        val l = listener ?: return
        try { nsd?.stopServiceDiscovery(l) } catch (e: Exception) { }
        listener = null
        queue.clear()
        resolving = false
        peers.clear()
    }

    private fun label(n: String) = n.removePrefix("LocalShare").trim().ifEmpty { "Phone" }

    @Suppress("DEPRECATION")
    private fun next() {
        if (resolving) return
        val i = queue.pollFirst() ?: return
        resolving = true
        try {
            nsd?.resolveService(i, object : NsdManager.ResolveListener {
                override fun onServiceResolved(r: NsdServiceInfo) {
                    main.post {
                        val h = r.host?.hostAddress
                        if (h != null && !h.contains(':')) { // IPv4 only, so the address can be typed and shared
                            val p = Peer(label(r.serviceName), "http://$h:${r.port}")
                            peers.removeAll { it.name == p.name || it.url == p.url }
                            peers.add(p)
                        }
                        resolving = false
                        next()
                    }
                }
                override fun onResolveFailed(s: NsdServiceInfo, e: Int) { main.post { resolving = false; next() } }
            })
        } catch (e: Exception) { resolving = false }
    }
}
