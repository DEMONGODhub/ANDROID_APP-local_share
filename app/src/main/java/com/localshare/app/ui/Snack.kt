package com.localshare.app.ui

import kotlinx.coroutines.flow.MutableSharedFlow

/** A message with an Undo button at the bottom of the screen, like Gmail. Shown by App() in MainActivity. */
data class SnackMsg(val text: String, val onUndo: () -> Unit, val onDone: () -> Unit)

object Snack {
    val flow = MutableSharedFlow<SnackMsg>(extraBufferCapacity = 8)
    /** [onUndo] runs if the person taps Undo; [onDone] runs if the message times out instead. */
    fun show(text: String, onUndo: () -> Unit, onDone: () -> Unit = {}) { flow.tryEmit(SnackMsg(text, onUndo, onDone)) }
}
