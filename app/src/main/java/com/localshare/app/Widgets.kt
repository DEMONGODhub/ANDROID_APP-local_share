package com.localshare.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/** Home-screen widgets: share + speed, send to TV, one-tap toggle. Redrawn from ShareController.refresh(). */
object Widgets {
    private val kinds = listOf(ShareWidget::class.java, TvWidget::class.java, MiniWidget::class.java)
    private var last = ""

    private fun ids(ctx: Context, c: Class<*>): IntArray =
        AppWidgetManager.getInstance(ctx).getAppWidgetIds(ComponentName(ctx, c))

    fun any(ctx: Context) = kinds.any { ids(ctx, it).isNotEmpty() }

    private fun tap(ctx: Context, action: String, code: Int): PendingIntent =
        PendingIntent.getActivity(
            ctx, code,
            Intent(ctx, WidgetActionActivity::class.java).setAction(action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

    /** Pushes the current state to every placed widget; skipped when nothing visible changed. */
    @Synchronized
    fun update(ctx: Context, st: UiState = ShareController.state.value, force: Boolean = false) {
        val sig = "${st.running}|${st.devices.size}|${st.speedLine}"
        if (!force && sig == last) return
        val mgr = AppWidgetManager.getInstance(ctx)
        var placed = false
        for (c in kinds) {
            val ids = ids(ctx, c)
            if (ids.isEmpty()) continue
            placed = true
            val v = when (c) {
                ShareWidget::class.java -> share(ctx, st)
                TvWidget::class.java -> tv(ctx, st)
                else -> mini(ctx, st)
            }
            mgr.updateAppWidget(ids, v)
        }
        if (placed) last = sig
    }

    private fun share(ctx: Context, st: UiState): RemoteViews {
        val v = RemoteViews(ctx.packageName, R.layout.widget_share)
        v.setTextViewText(
            R.id.w_status,
            if (st.running) ctx.getString(R.string.widget_sharing) + " · " + ctx.getString(R.string.widget_devices, st.devices.size)
            else ctx.getString(R.string.widget_off)
        )
        v.setTextViewText(R.id.w_speed, if (!st.running) "" else st.speedLine.ifEmpty { ctx.getString(R.string.widget_idle) })
        v.setTextViewText(R.id.w_btn, ctx.getString(if (st.running) R.string.widget_stop else R.string.widget_start))
        v.setInt(R.id.w_btn, "setBackgroundResource", if (st.running) R.drawable.widget_pill_stop else R.drawable.widget_pill_on)
        v.setOnClickPendingIntent(R.id.w_btn, tap(ctx, if (st.running) "stop" else "start", 1))
        v.setOnClickPendingIntent(R.id.w_root, tap(ctx, "open", 2))
        return v
    }

    private fun tv(ctx: Context, st: UiState): RemoteViews {
        val v = RemoteViews(ctx.packageName, R.layout.widget_tv)
        v.setTextViewText(R.id.w_status, ctx.getString(if (st.running) R.string.widget_tv_hint else R.string.widget_tv_first))
        v.setOnClickPendingIntent(R.id.w_root, tap(ctx, "tv", 3))
        return v
    }

    private fun mini(ctx: Context, st: UiState): RemoteViews {
        val v = RemoteViews(ctx.packageName, R.layout.widget_mini)
        v.setTextViewText(R.id.w_btn, ctx.getString(if (st.running) R.string.widget_mini_on else R.string.widget_mini_off))
        v.setInt(R.id.w_btn, "setBackgroundResource", if (st.running) R.drawable.widget_dot_on else R.drawable.widget_dot_off)
        v.setTextViewText(R.id.w_status, if (st.running) st.speedLine.ifEmpty { ctx.getString(R.string.widget_sharing) } else ctx.getString(R.string.widget_off))
        v.setOnClickPendingIntent(R.id.w_root, tap(ctx, if (st.running) "stop" else "start", 4))
        return v
    }
}

open class BaseWidget : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, m: AppWidgetManager, ids: IntArray) {
        ShareController.init(ctx)
        Widgets.update(ctx, ShareController.state.value, true)
    }
}

class ShareWidget : BaseWidget()
class TvWidget : BaseWidget()
class MiniWidget : BaseWidget()
