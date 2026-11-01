package com.localshare.app

import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

/** Quick Settings tile: tap to start or stop sharing without opening the app. */
class ShareTile : TileService() {
    override fun onStartListening() { paint() }

    private fun paint() {
        val t = qsTile ?: return
        val on = ShareController.state.value.running
        t.state = if (on) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        t.label = "LocalShare"
        if (Build.VERSION.SDK_INT >= 29) t.subtitle = if (on) "Sharing" else "Off"
        t.updateTile()
    }

    override fun onClick() {
        if (ShareController.state.value.running) {
            try { ShareService.stop(this) } catch (e: Exception) { }
            paint()
        } else {
            // starting from here is not always allowed in the background, so open the app, which starts it
            val i = Intent(this, MainActivity::class.java).setAction(MainActivity.ACTION_START).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (Build.VERSION.SDK_INT >= 34) {
                startActivityAndCollapse(PendingIntent.getActivity(this, 5, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
            } else {
                @Suppress("DEPRECATION") startActivityAndCollapse(i)
            }
        }
    }
}
