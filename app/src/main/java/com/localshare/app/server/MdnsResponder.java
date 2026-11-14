package com.localshare.app.server;

import java.io.ByteArrayOutputStream;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.MulticastSocket;
import java.util.List;

/** Answers "name.local" lookups on the Wi-Fi (mDNS), so people can type a name instead of an IP. Browsers that cannot resolve .local still need the IP. */
public final class MdnsResponder {
    private final String label;
    private final byte[][] ips;
    private final int port;
    private volatile MulticastSocket sock;
    private volatile boolean on;

    public MdnsResponder(String name, List<String> ipv4) { this(name, ipv4, 5353); }

    public MdnsResponder(String name, List<String> ipv4, int port) {
        this.label = clean(name);
        this.port = port;
        ips = new byte[ipv4.size()][];
        for (int i = 0; i < ips.length; i++) {
            String[] p = ipv4.get(i).split("\\.");
            ips[i] = new byte[]{(byte) Integer.parseInt(p[0]), (byte) Integer.parseInt(p[1]), (byte) Integer.parseInt(p[2]), (byte) Integer.parseInt(p[3])};
        }
    }

    /** "DEMON GOD" -> "demon-god"; never empty. */
    public static String clean(String n) {
        String s = (n == null ? "" : n).toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (s.length() > 40) s = s.substring(0, 40).replaceAll("-+$", "");
        return s.isEmpty() ? "localshare" : s;
    }

    public String host() { return label + ".local"; }

    public synchronized void start() throws java.io.IOException {
        if (on) return;
        MulticastSocket s = new MulticastSocket(null);
        s.setReuseAddress(true);
        s.bind(new InetSocketAddress(port));
        try { s.joinGroup(InetAddress.getByName("224.0.0.251")); } catch (java.io.IOException e) { /* unicast queries still work */ }
        sock = s;
        on = true;
        Thread t = new Thread(new Runnable() { @Override public void run() { loop(s); } }, "mdns");
        t.setDaemon(true);
        t.start();
    }

    public synchronized void stop() {
        on = false;
        if (sock != null) sock.close();
    }

    private void loop(MulticastSocket s) {
        byte[] buf = new byte[1500];
        while (on) {
            try {
                DatagramPacket p = new DatagramPacket(buf, buf.length);
                s.receive(p);
                byte[] r = answer(buf, p.getLength());
                if (r == null) continue;
                s.send(new DatagramPacket(r, r.length, p.getSocketAddress())); // to the asker
                if (port == 5353) s.send(new DatagramPacket(r, r.length, InetAddress.getByName("224.0.0.251"), 5353));
            } catch (Exception e) {
                if (!on) return;
            }
        }
    }

    /** @return the reply for a query that asks for our name (type A or ANY), else null. */
    byte[] answer(byte[] q, int len) {
        if (len < 12 || (q[2] & 0x80) != 0) return null; // too short, or itself a response
        int qd = ((q[4] & 255) << 8) | (q[5] & 255), i = 12;
        int id = ((q[0] & 255) << 8) | (q[1] & 255);
        for (int n = 0; n < qd && i < len; n++) {
            StringBuilder name = new StringBuilder();
            while (i < len && q[i] != 0) {
                if ((q[i] & 0xC0) != 0) return null; // compressed names: not worth handling
                int l = q[i++] & 255;
                if (i + l > len) return null;
                if (name.length() > 0) name.append('.');
                name.append(new String(q, i, l, java.nio.charset.StandardCharsets.UTF_8));
                i += l;
            }
            i++;
            if (i + 4 > len) return null;
            int type = ((q[i] & 255) << 8) | (q[i + 1] & 255);
            i += 4;
            if (name.toString().equalsIgnoreCase(host()) && (type == 1 || type == 255) && ips.length > 0) return reply(id);
        }
        return null;
    }

    private byte[] reply(int id) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        o.write(id >> 8); o.write(id); o.write(0x84); o.write(0);
        o.write(0); o.write(0); o.write(0); o.write(ips.length); o.write(0); o.write(0); o.write(0); o.write(0);
        for (byte[] ip : ips) {
            o.write(label.length()); o.write(label.getBytes(java.nio.charset.StandardCharsets.UTF_8), 0, label.length());
            o.write(5); o.write('l'); o.write('o'); o.write('c'); o.write('a'); o.write('l'); o.write(0);
            o.write(0); o.write(1); o.write(0x80); o.write(1); // A, cache-flush + IN
            o.write(0); o.write(0); o.write(0); o.write(120); // TTL 120 s
            o.write(0); o.write(4);
            o.write(ip, 0, 4);
        }
        return o.toByteArray();
    }
}
