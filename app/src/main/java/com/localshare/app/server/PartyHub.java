package com.localshare.app.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Rooms for the Arcade games (Tic-Tac-Toe, Connect 4, Pong, Snake Battle, Draw &amp; Guess).
 * The server only keeps who is in which room and passes messages along; the first person in a room (the host
 * of the room) runs the game in their browser. Client to server text frames: "J|game|code", "B|payload"
 * (to everyone else) and "T|id|payload" (to one person). Server to client: room lists and relayed messages.
 */
final class PartyHub {
    private static final Charset UTF8 = Charset.forName("UTF-8");
    static final int MAX_ROOM = 12, MAX_MSG = 16000, MAX_ROOMS = 50, MAX_CONN = 60, MAX_QUEUE = 256, RATE = 300;

    private static final class Member {
        final String id, name;
        final GameHub.Client c;
        final ConcurrentLinkedQueue<String> q = new ConcurrentLinkedQueue<String>();
        final AtomicBoolean busy = new AtomicBoolean();
        String room;
        long win;
        int cnt;

        Member(String id, String name, GameHub.Client c) {
            this.id = id;
            this.name = name;
            this.c = c;
        }
    }

    private final ServerConfig cfg;
    private final ExecutorService pool;
    private final Map<String, List<Member>> rooms = new HashMap<String, List<Member>>();
    private int conns;

    PartyHub(ServerConfig cfg, ExecutorService pool) {
        this.cfg = cfg;
        this.pool = pool;
    }

    synchronized void shutdown() {
        for (List<Member> l : rooms.values()) for (Member m : l) m.c.close();
        rooms.clear();
    }

    /** Runs one WebSocket on the calling thread until it closes. */
    void run(String id, String name, Socket sock, InputStream in, OutputStream out) {
        GameHub.Client c = new GameHub.Client(sock, out);
        synchronized (this) {
            if (conns >= MAX_CONN) {
                try {
                    c.frame(8, new byte[0]);
                } catch (IOException ignored) {
                }
                return;
            }
            conns++;
        }
        Member me = new Member(id, name, c);
        try {
            sock.setSoTimeout(600000);
            while (!c.dead) {
                String m = read(in, c);
                if (m == null) break;
                long now = System.currentTimeMillis();
                if (now - me.win > 1000) {
                    me.win = now;
                    me.cnt = 0;
                }
                if (++me.cnt > RATE) continue; // too chatty: drop
                handle(me, m);
            }
        } catch (IOException ignored) {
        } finally {
            synchronized (this) {
                conns--;
            }
            leave(me);
            c.close();
        }
    }

    private void handle(Member me, String m) {
        if (m.startsWith("J|")) {
            String[] p = m.split("\\|", -1);
            if (p.length < 3 || !p[1].matches("[a-z0-9]{1,12}") || !p[2].matches("[A-Za-z0-9]{0,8}")) return;
            join(me, p[1] + "#" + p[2]);
        } else if (m.startsWith("B|")) {
            relay(me, null, m.substring(2));
        } else if (m.startsWith("T|")) {
            int i = m.indexOf('|', 2);
            if (i > 2) relay(me, m.substring(2, i), m.substring(i + 1));
        }
    }

    private synchronized void join(Member me, String key) {
        leave(me);
        List<Member> l = rooms.get(key);
        if (l == null) {
            if (rooms.size() >= MAX_ROOMS) {
                send(me, "{\"t\":\"full\"}");
                return;
            }
            l = new ArrayList<Member>();
            rooms.put(key, l);
        }
        for (int i = l.size() - 1; i >= 0; i--) { // the same person in a second tab replaces the first
            if (l.get(i).id.equals(me.id)) {
                l.get(i).room = null;
                l.get(i).c.close();
                l.remove(i);
            }
        }
        if (l.size() >= MAX_ROOM) {
            send(me, "{\"t\":\"full\"}");
            return;
        }
        l.add(me);
        me.room = key;
        announce(l);
    }

    private synchronized void leave(Member me) {
        if (me.room == null) return;
        String key = me.room;
        List<Member> l = rooms.get(key);
        me.room = null;
        if (l == null) return;
        l.remove(me);
        if (l.isEmpty()) rooms.remove(key); else announce(l);
    }

    private void announce(List<Member> l) {
        StringBuilder sb = new StringBuilder();
        for (Member m : l) {
            if (sb.length() > 0) sb.append(',');
            sb.append("{\"id\":").append(Util.q(m.id)).append(",\"n\":").append(Util.q(m.name)).append('}');
        }
        for (Member m : l) {
            send(m, "{\"t\":\"room\",\"you\":" + Util.q(m.id) + ",\"host\":" + Util.q(l.get(0).id) + ",\"p\":[" + sb + "]}");
        }
    }

    private synchronized void relay(Member me, String to, String payload) {
        if (me.room == null) return;
        List<Member> l = rooms.get(me.room);
        if (l == null) return;
        String msg = "{\"t\":\"m\",\"f\":" + Util.q(me.id) + ",\"d\":" + Util.q(payload) + "}";
        for (Member m : l) if (m != me && (to == null || m.id.equals(to))) send(m, msg);
    }

    /** Queues a message so one slow phone can never hold up the host. */
    private void send(final Member m, String text) {
        if (m.q.size() > MAX_QUEUE) {
            m.c.close();
            return;
        }
        m.q.add(text);
        drain(m);
    }

    private void drain(final Member m) {
        if (!m.busy.compareAndSet(false, true)) return;
        try {
            pool.execute(new Runnable() {
                @Override public void run() {
                    try {
                        String t;
                        while ((t = m.q.poll()) != null) m.c.send(t);
                    } catch (IOException e) {
                        m.c.close();
                    } finally {
                        m.busy.set(false);
                        if (!m.q.isEmpty() && !m.c.dead) drain(m);
                    }
                }
            });
        } catch (RejectedExecutionException e) {
            m.busy.set(false);
        }
    }

    private static String read(InputStream in, GameHub.Client c) throws IOException {
        while (true) {
            int b0 = in.read();
            if (b0 < 0) return null;
            int op = b0 & 15, b1 = in.read();
            if (b1 < 0 || (b1 & 128) == 0) return null; // browsers always mask
            long len = b1 & 127;
            if (len == 126) len = (in.read() << 8) | in.read();
            else if (len == 127) return null;
            if (len > MAX_MSG) return null;
            byte[] key = new byte[4], d = new byte[(int) len];
            fill(in, key);
            fill(in, d);
            for (int i = 0; i < d.length; i++) d[i] ^= key[i & 3];
            if (op == 8) return null;
            if (op == 9) c.frame(10, d);
            else if (op == 1) return new String(d, UTF8);
        }
    }

    private static void fill(InputStream in, byte[] b) throws IOException {
        int o = 0;
        while (o < b.length) {
            int n = in.read(b, o, b.length - o);
            if (n < 0) throw new IOException("closed");
            o += n;
        }
    }
}
