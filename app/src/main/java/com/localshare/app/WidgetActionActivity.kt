package com.localshare.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Toast

/** Invisible stop for widget taps: an activity may start the sharing service even when the app is closed. */
class WidgetActionActivity : Activity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        ShareController.init(this)
        when (intent?.action) {
            "start" -> { ShareService.start(this); finish() }
            "stop" -> { ShareService.stop(this); finish() }
            "tv" -> {
                val st = ShareController.state.value
                if (!st.running) {
                    Toast.makeText(this, R.string.widget_tv_first, Toast.LENGTH_SHORT).show()
                    finish()
                } else SendToTv.scan(this, st) { msg ->
                    Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
                    finish()
                }
            }
            else -> { startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); finish() }
        }
    }
}
