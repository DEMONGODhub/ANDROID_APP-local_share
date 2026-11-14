package com.localshare.app

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.UUID

/** Sends files or text to another LocalShare phone: sign in, ask, wait for Accept, then stream. Blocking: call from a thread. */
object PeerSender {
    private fun enc(s: String) = URLEncoder.encode(s, "UTF-8")

    private fun device(ctx: Context): String {
        val sp = ctx.getSharedPreferences("peer", Context.MODE_PRIVATE)
        return sp.getString("dev", null) ?: UUID.randomUUID().toString().replace("-", "").take(24).also { sp.edit().putString("dev", it).apply() }
    }

    private fun open(base: String, path: String, method: String, cookie: String = ""): HttpURLConnection =
        (URL(base.trimEnd('/') + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 5000
            readTimeout = 30000
            if (cookie.isNotEmpty()) setRequestProperty("Cookie", cookie)
        }

    private fun form(c: HttpURLConnection, body: String) {
        c.doOutput = true
        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        c.outputStream.use { it.write(body.toByteArray()) }
    }

    private fun error(c: HttpURLConnection): String = try {
        JSONObject((c.errorStream ?: c.inputStream).bufferedReader().readText()).optString("error", "Refused (${c.responseCode})")
    } catch (e: Exception) { "Refused (${c.responseCode})" }

    private fun login(ctx: Context, base: String, password: String): String {
        val c = open(base, "/api/login", "POST")
        form(c, "name=${enc(ShareController.state.value.hostName)}&password=${enc(password)}&device=${enc(device(ctx))}")
        if (c.responseCode != 200) throw IllegalStateException(if (c.responseCode == 401) "Wrong password" else error(c))
        return c.headers["Set-Cookie"]?.firstOrNull { it.startsWith("ls_token=") }?.substringBefore(';') ?: throw IllegalStateException("The other phone did not let us in")
    }

    private fun info(ctx: Context, u: Uri): Pair<String, Long> {
        var name = u.lastPathSegment ?: "file"
        var size = -1L
        ctx.contentResolver.query(u, null, null, null, null)?.use {
            if (it.moveToFirst()) {
                val n = it.getColumnIndex(OpenableColumns.DISPLAY_NAME); if (n >= 0) name = it.getString(n)
                val z = it.getColumnIndex(OpenableColumns.SIZE); if (z >= 0 && !it.isNull(z)) size = it.getLong(z)
            }
        }
        return name to size
    }

    /** @return a sentence for the person. */
    fun sendText(ctx: Context, base: String, password: String, text: String): String = try {
        val ck = login(ctx, base, password)
        val c = open(base, "/api/clip", "POST", ck)
        form(c, "text=${enc(text)}")
        if (c.responseCode == 200) "Sent" else error(c)
    } catch (e: Exception) { e.message ?: "Could not reach the other phone" }

    fun sendFiles(ctx: Context, base: String, password: String, uris: List<Uri>, status: (String) -> Unit): String = try {
        val files = uris.map { it to info(ctx, it) }.filter { it.second.second >= 0 }
        if (files.isEmpty()) throw IllegalStateException("Nothing to send")
        status("Connecting…")
        val ck = login(ctx, base, password)
        val o = open(base, "/api/offer", "POST", ck)
        form(o, "names=${enc(files.joinToString("\n") { it.second.first })}&sizes=${files.joinToString(",") { it.second.second.toString() }}")
        if (o.responseCode != 200) throw IllegalStateException(error(o))
        val id = JSONObject(o.inputStream.bufferedReader().readText()).getString("id")
        status("Waiting for the other phone to accept…")
        val until = System.currentTimeMillis() + 130000
        while (true) {
            if (System.currentTimeMillis() > until) throw IllegalStateException("No answer")
            Thread.sleep(1200)
            val g = open(base, "/api/offer?id=$id", "GET", ck)
            when (JSONObject(g.inputStream.bufferedReader().readText()).getString("state")) {
                "accepted" -> break
                "declined" -> throw IllegalStateException("The other phone did not accept")
            }
        }
        var bad = 0
        files.forEachIndexed { i, (u, meta) ->
            status("Sending ${i + 1} of ${files.size}: ${meta.first}")
            try {
                val c = open(base, "/api/inbox?id=$id&i=$i", "POST", ck)
                c.doOutput = true
                c.setFixedLengthStreamingMode(meta.second)
                c.readTimeout = 120000
                ctx.contentResolver.openInputStream(u)!!.use { src -> c.outputStream.use { src.copyTo(it, 65536) } }
                if (c.responseCode != 200) bad++
            } catch (e: Exception) { bad++ }
        }
        if (bad == 0) "Sent ${files.size} ${if (files.size == 1) "file" else "files"}" else "$bad of ${files.size} failed"
    } catch (e: Exception) { e.message ?: "Could not reach the other phone" }
}
