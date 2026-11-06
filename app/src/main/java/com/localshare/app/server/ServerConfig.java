package com.localshare.app.server;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/** Live, thread-safe settings and block list. Changes apply immediately to the running server. */
public final class ServerConfig {
    public static final class Block {
        public final String id, name, ip, device;

        public Block(String id, String name, String ip, String device) {
            this.id = id;
            this.name = name;
            this.ip = ip == null ? "" : ip;
            this.device = device == null ? "" : device;
        }

        @Override public boolean equals(Object o) {
            if (!(o instanceof Block)) return false;
            Block b = (Block) o;
            return id.equals(b.id) && name.equals(b.name) && ip.equals(b.ip) && device.equals(b.device);
        }

        @Override public int hashCode() {
            return id.hashCode();
        }
    }

    public volatile String password = "";
    public volatile int maxClients = 5;
    public volatile boolean gameEnabled = true;
    public volatile boolean allowUploads = false;
    public volatile boolean allowDelete = false;
    /** How the host shows up to guests: a name and a small PNG picture (null = none). Only people who joined can fetch it. */
    /** The host's accent colour as #RRGGBB; the guest page uses it for buttons and highlights. */
    public volatile String accent = "#FFD60A";
    public void setAccent(String a) { if (a != null && a.matches("#[0-9A-Fa-f]{6}")) accent = a.toUpperCase(); }
    public volatile String hostName = "Host";
    public volatile byte[] hostPic;
    public volatile int hostPicVer;

    public void setHostProfile(String name, byte[] png) {
        String n = name == null ? "" : name.trim();
        hostName = n.length() == 0 ? "Host" : n.substring(0, Math.min(24, n.length()));
        if (png != null && png.length > 0 && png.length <= 200 * 1024) { hostPic = png; hostPicVer++; }
    }

    /** Every guest may use the TV remote on the web page (only while a LocalShare TV is connected). Off by default: the host grants it per device. */
    public volatile boolean remote = false;
    /** Game-only hosting: nobody but the host can see any file. */
    public volatile boolean gameOnly = false;
    /** 0 = PvP (endless, respawn), 1 = Battle Royale (rounds, shrinking zone). */
    public volatile int gameMode = 0;
    /** Rules the host picks for the game. */
    public volatile boolean gameTeams = false, gameShots = true;
    /** Sparring bots 0..3; zone speed 0 fast / 1 normal / 2 slow; health 0 low / 1 normal / 2 tough. */
    public volatile int gameBots = 1, gameZone = 1, gameHealth = 1;

    /** Sets one rule by name ("teams", "shots", "bots", "zone", "health"); false for an unknown name. */
    public boolean setRule(String k, int v) {
        if (k.equals("teams")) gameTeams = v != 0;
        else if (k.equals("shots")) gameShots = v != 0;
        else if (k.equals("bots")) gameBots = Math.max(0, Math.min(3, v));
        else if (k.equals("zone")) gameZone = Math.max(0, Math.min(2, v));
        else if (k.equals("health")) gameHealth = Math.max(0, Math.min(2, v));
        else return false;
        changed();
        return true;
    }

    public String rulesText() { return (gameTeams ? 1 : 0) + "," + (gameShots ? 1 : 0) + "," + gameBots + "," + gameZone + "," + gameHealth; }

    public void loadRules(String s) {
        try {
            String[] p = s.split(",");
            if (p.length < 5) return;
            gameTeams = !p[0].trim().equals("0");
            gameShots = !p[1].trim().equals("0");
            gameBots = Math.max(0, Math.min(3, Integer.parseInt(p[2].trim())));
            gameZone = Math.max(0, Math.min(2, Integer.parseInt(p[3].trim())));
            gameHealth = Math.max(0, Math.min(2, Integer.parseInt(p[4].trim())));
        } catch (RuntimeException ignored) { }
    }

    /** Hall of fame: each player's best score, kills and round wins, kept between sessions. */
    private final ConcurrentHashMap<String, int[]> records = new ConcurrentHashMap<String, int[]>();

    public void record(String name, int score, int kills, int wins) {
        if (name == null || name.length() == 0) return;
        synchronized (records) {
            int[] r = records.get(name);
            if (r == null) { r = new int[3]; records.put(name, r); }
            boolean up = score > r[0] || wins > 0 || kills > 0;
            r[0] = Math.max(r[0], score);
            r[1] += kills;
            r[2] += wins;
            if (up) changed();
        }
    }

    /** Top n as JSON: [[name,best,kills,wins],...] ordered by wins, then best score. */
    public String hallJson(int n) {
        java.util.List<String> names;
        synchronized (records) { names = new java.util.ArrayList<String>(records.keySet()); }
        java.util.Collections.sort(names, new java.util.Comparator<String>() {
            @Override public int compare(String a, String b) {
                int[] x = records.get(a), y = records.get(b);
                if (x == null || y == null) return 0;
                if (y[2] != x[2]) return y[2] - x[2];
                return y[0] - x[0];
            }
        });
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < names.size() && i < n; i++) {
            int[] r = records.get(names.get(i));
            if (r == null) continue;
            if (i > 0) sb.append(',');
            sb.append('[').append(Util.q(names.get(i))).append(',').append(r[0]).append(',').append(r[1]).append(',').append(r[2]).append(']');
        }
        return sb.append(']').toString();
    }

    public void clearRecords() { records.clear(); changed(); }

    public String recordsText() {
        StringBuilder sb = new StringBuilder();
        for (java.util.Map.Entry<String, int[]> e : records.entrySet()) {
            int[] r = e.getValue();
            sb.append(e.getKey().replace('\t', ' ').replace('\n', ' ')).append('\t').append(r[0]).append('\t').append(r[1]).append('\t').append(r[2]).append('\n');
        }
        return sb.toString();
    }

    public void loadRecords(String text) {
        for (String line : text.split("\n")) {
            String[] p = line.split("\t");
            if (p.length != 4) continue;
            try { records.put(p[0], new int[]{Integer.parseInt(p[1]), Integer.parseInt(p[2]), Integer.parseInt(p[3])}); } catch (NumberFormatException ignored) { }
        }
    }

    /** New devices wait for the host (or a manager) to approve them before they can see anything. */
    public volatile boolean askToJoin = false;

    /** Switches the game mode live; the app saves it through {@link #onChange}. */
    public void setGameMode(int m) {
        int v = m == 1 ? 1 : 0;
        if (gameMode != v) {
            gameMode = v;
            changed();
        }
    }

    /** Per-device extras the host can grant (or restrict) from the Devices tab. */
    public static final int P_DELETE = 1, P_RENAME = 2, P_EDIT = 4, P_GAME_ONLY = 8, P_UPLOAD = 16, P_MOVE = 32, P_ALL = 63, P_REMOTE = 256 /* may press the TV remote */,
            P_MANAGER = 64 /* shares the host's authority */, P_TRUSTED = 128 /* already approved to join */;
    private final ConcurrentHashMap<String, Integer> perms = new ConcurrentHashMap<String, Integer>();

    /** Key a device keeps across sign-ins: its browser id, or its IP address when it has none. */
    public static String permKey(String device, String ip) {
        return device != null && device.length() > 0 ? "d:" + device : "i:" + ip;
    }

    public int perms(String key) {
        Integer v = perms.get(key);
        return v == null ? 0 : v;
    }

    public void setPerms(String key, int v) {
        v &= 511; // file rights plus the manager, already-approved and TV-remote bits
        if (v == 0) perms.remove(key); else perms.put(key, v);
        changed();
    }

    public java.util.Map<String, Integer> permsSnapshot() {
        return new java.util.HashMap<String, Integer>(perms);
    }

    public void loadPerms(java.util.Map<String, Integer> m) {
        perms.clear();
        for (java.util.Map.Entry<String, Integer> e : m.entrySet()) if ((e.getValue() & 511) != 0) perms.put(e.getKey(), e.getValue() & 511);
    }
    // ---- invite links: a pass that works for a set time and a set number of people, so nobody needs the password ----
    public static final class Invite {
        public final String token;
        public final long expires;
        public volatile int uses; // people who can still use it; -1 = anyone until it expires
        Invite(String token, long expires, int uses) { this.token = token; this.expires = expires; this.uses = uses; }
    }

    private final java.util.Map<String, Invite> invites = new java.util.concurrent.ConcurrentHashMap<String, Invite>();
    private final java.util.Map<String, Object[]> grants = new java.util.concurrent.ConcurrentHashMap<String, Object[]>(); // device -> {expires, token}
    private final java.security.SecureRandom inviteRnd = new java.security.SecureRandom();

    /** @param ms how long it works; @param uses how many people (-1 = unlimited) */
    public String createInvite(long ms, int uses) {
        byte[] b = new byte[12];
        inviteRnd.nextBytes(b);
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format("%02x", x & 255));
        Invite i = new Invite(sb.toString(), System.currentTimeMillis() + ms, uses);
        invites.put(i.token, i);
        changed();
        return i.token;
    }

    /** The invite when it is still good, otherwise null. */
    public Invite invite(String token) {
        if (token == null || token.length() == 0) return null;
        Invite i = invites.get(token);
        if (i == null) return null;
        if (i.expires <= System.currentTimeMillis()) { invites.remove(token); return null; }
        return i.uses == 0 ? null : i;
    }

    /** Uses one place of the invite and lets this device sign in again, without the password, until the invite would have expired. */
    public synchronized boolean useInvite(String token, String deviceKey) {
        Invite i = invite(token);
        if (i == null) return false;
        if (i.uses > 0) i.uses--;
        grants.put(deviceKey, new Object[]{Long.valueOf(i.expires), i.token});
        changed();
        return true;
    }

    public boolean granted(String deviceKey) {
        Object[] g = grants.get(deviceKey);
        if (g == null) return false;
        if (((Long) g[0]).longValue() <= System.currentTimeMillis() || !invites.containsKey((String) g[1])) { grants.remove(deviceKey); return false; }
        return true;
    }

    public void revokeInvite(String token) {
        invites.remove(token);
        for (java.util.Map.Entry<String, Object[]> e : grants.entrySet()) if (token.equals(e.getValue()[1])) grants.remove(e.getKey());
        changed();
    }

    public java.util.List<Invite> activeInvites() {
        java.util.List<Invite> out = new java.util.ArrayList<Invite>();
        for (Invite i : invites.values()) if (invite(i.token) != null) out.add(i);
        java.util.Collections.sort(out, new java.util.Comparator<Invite>() {
            @Override public int compare(Invite a, Invite b) { return a.expires < b.expires ? -1 : (a.expires == b.expires ? 0 : 1); }
        });
        return out;
    }

    /** Guests sign in again this long after joining; 0 means never. */
    public volatile long sessionMs = 6L * 3600000L;
    public volatile long maxUploadBytes = 2L * 1024 * 1024 * 1024;
    public final ActivityLog log = new ActivityLog();
    /** Called from any thread whenever the block list changes. */
    public volatile Runnable onChange;

    private final ConcurrentHashMap<String, Block> blocks = new ConcurrentHashMap<String, Block>();

    public List<Block> blocks() {
        return new ArrayList<Block>(blocks.values());
    }

    public void setBlocks(List<Block> list) {
        blocks.clear();
        for (Block b : list) blocks.put(b.id, b);
    }

    public boolean isBlocked(String ip, String device) {
        for (Block b : blocks.values()) {
            if (b.ip.length() > 0 && b.ip.equals(ip)) return true;
            if (b.device.length() > 0 && device != null && b.device.equals(device)) return true;
        }
        return false;
    }

    void addBlock(Block b) {
        blocks.put(b.id, b);
        changed();
    }

    public void removeBlock(String id) {
        if (blocks.remove(id) != null) changed();
    }

    private void changed() {
        Runnable r = onChange;
        if (r != null) r.run();
    }
}
