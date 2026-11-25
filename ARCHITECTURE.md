# LocalShare architecture

| Module | Where | Job | Talks to others through |
|---|---|---|---|
| Server | `app/src/main/java/.../server` (pure Java, no Android imports) | HTTP, auth, uploads, chat, games | `ServerConfig` (settings + `Sink` callbacks) |
| App | `app/src/main/java/.../*.kt` (Compose) | screens, service, settings | `ShareController` state flow |
| Side panel | `SidePanel.kt` | nav, Open as host, Join a friend | plain lambdas, no state of its own |
| Web UI | `app/src/main/assets/web` | `app.js` page, `ws.js` workspaces/panels, `side.js` sidebar, `i18n.js` languages, `*.css` | `window.WS`, `window.helpHtml` |
| Rust (optional) | `rust/localshare-core` | pure helpers, off the transfer path | C ABI, Java fallback stays default |

The server is tested on a PC: `javac` + `Harness` (see `.github/workflows/tests.yml`).

## Add a language
1. **Web:** copy the `HI` dictionary in `web/i18n.js`, translate the values, register it in the language list (the switch in the side panel picks it up).
2. **Android:** copy `res/values-hi/strings.xml` to `res/values-xx/` and translate. Every label in `SidePanel.kt` and the bottom bar already comes from string resources.
3. Run the harness; the page must still pass.

## Rust
`cd rust/localshare-core && cargo test`. Android needs `cargo-ndk` and the NDK to build `.so` files; build on your own machine. Only worth wiring in for thumbnails, ZIP or many clients: Wi-Fi is the bottleneck for plain downloads, so the streaming path is deliberately left in Java.
