package com.localshare.app.server;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;

/**
 * HTTPS for a share that has no internet name: makes (once) and reuses a self-signed certificate.
 * Pure Java (no extra libraries), so it also runs in the PC tests. Traffic is encrypted; the
 * browser shows a one-time "not trusted" notice because no authority has vouched for the phone.
 */
public final class SelfSigned {
    public final SSLContext context;
    /** SHA-256 of the certificate, shown to the host so a guest can compare it. */
    public final String fingerprint;

    private SelfSigned(SSLContext c, String fp) {
        context = c;
        fingerprint = fp;
    }

    private static final String KEY_FILE = "tls.key", CRT_FILE = "tls.crt";
    private static final long DAY = 86400000L;

    /** Loads the saved certificate from dir, or makes a new one when there is none or it is nearly expired. */
    public static synchronized SelfSigned load(File dir) throws Exception {
        File kf = new File(dir, KEY_FILE), cf = new File(dir, CRT_FILE);
        PrivateKey key = null;
        X509Certificate crt = null;
        try {
            if (kf.isFile() && cf.isFile()) {
                key = KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(read(kf)));
                crt = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new FileInputStream(cf));
                if (crt.getNotAfter().getTime() - System.currentTimeMillis() < 30 * DAY) crt = null;
            }
        } catch (Exception bad) {
            crt = null;
        }
        if (crt == null || key == null) {
            KeyPairGenerator g = KeyPairGenerator.getInstance("EC");
            g.initialize(new ECGenParameterSpec("secp256r1"), new SecureRandom());
            KeyPair kp = g.generateKeyPair();
            byte[] der = certificate(kp);
            crt = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new java.io.ByteArrayInputStream(der));
            key = kp.getPrivate();
            if (!dir.isDirectory()) dir.mkdirs();
            write(kf, key.getEncoded());
            write(cf, der);
            kf.setReadable(false, false);
            kf.setReadable(true, true); // only this app may read the private key
        }
        char[] pw = "ls".toCharArray();
        KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());
        ks.load(null, null);
        ks.setKeyEntry("ls", key, pw, new Certificate[] { crt });
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(ks, pw);
        SSLContext ctx = SSLContext.getInstance("TLS");
        ctx.init(kmf.getKeyManagers(), null, new SecureRandom());
        byte[] h = MessageDigest.getInstance("SHA-256").digest(crt.getEncoded());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < h.length; i++) {
            if (i > 0) sb.append(':');
            sb.append(String.format(Locale.US, "%02X", h[i] & 255));
        }
        return new SelfSigned(ctx, sb.toString());
    }

    private static byte[] read(File f) throws IOException {
        FileInputStream in = new FileInputStream(f);
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] b = new byte[4096];
            int n;
            while ((n = in.read(b)) > 0) o.write(b, 0, n);
            return o.toByteArray();
        } finally {
            in.close();
        }
    }

    private static void write(File f, byte[] d) throws IOException {
        FileOutputStream o = new FileOutputStream(f);
        try {
            o.write(d);
        } finally {
            o.close();
        }
    }

    // ---- a minimal X.509 v3 writer (DER) ----

    private static byte[] tlv(int tag, byte[]... parts) {
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        for (int i = 0; i < parts.length; i++) body.write(parts[i], 0, parts[i].length);
        byte[] b = body.toByteArray();
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        o.write(tag);
        if (b.length < 128) o.write(b.length);
        else if (b.length < 256) { o.write(0x81); o.write(b.length); }
        else { o.write(0x82); o.write(b.length >> 8); o.write(b.length & 255); }
        o.write(b, 0, b.length);
        return o.toByteArray();
    }

    private static byte[] oid(int... a) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        o.write(a[0] * 40 + a[1]);
        for (int i = 2; i < a.length; i++) {
            int v = a[i];
            if (v < 128) o.write(v);
            else if (v < 16384) { o.write(0x80 | (v >> 7)); o.write(v & 127); }
            else { o.write(0x80 | (v >> 14)); o.write(0x80 | ((v >> 7) & 127)); o.write(v & 127); }
        }
        return tlv(0x06, o.toByteArray());
    }

    private static byte[] utcTime(long t) {
        SimpleDateFormat f = new SimpleDateFormat("yyMMddHHmmss'Z'", Locale.US);
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        return tlv(0x17, f.format(new Date(t)).getBytes());
    }

    private static byte[] certificate(KeyPair kp) throws Exception {
        byte[] sigAlg = tlv(0x30, oid(1, 2, 840, 10045, 4, 3, 2)); // ecdsa-with-SHA256
        byte[] name = tlv(0x30, tlv(0x31, tlv(0x30, oid(2, 5, 4, 3), tlv(0x0C, "LocalShare".getBytes()))));
        long now = System.currentTimeMillis();
        byte[] serial = new byte[16];
        new SecureRandom().nextBytes(serial);
        serial[0] &= 0x7F;
        serial[0] |= 0x40; // positive and not shortened
        byte[] san = tlv(0x30, oid(2, 5, 29, 17), tlv(0x04, tlv(0x30,
            tlv(0x82, "localhost".getBytes()), tlv(0x87, new byte[] { 127, 0, 0, 1 }))));
        byte[] ku = tlv(0x30, oid(2, 5, 29, 15), tlv(0x01, new byte[] { (byte) 0xFF }), tlv(0x04, tlv(0x03, new byte[] { 7, (byte) 0x80 })));
        byte[] eku = tlv(0x30, oid(2, 5, 29, 37), tlv(0x04, tlv(0x30, oid(1, 3, 6, 1, 5, 5, 7, 3, 1))));
        byte[] bc = tlv(0x30, oid(2, 5, 29, 19), tlv(0x01, new byte[] { (byte) 0xFF }), tlv(0x04, tlv(0x30)));
        byte[] tbs = tlv(0x30,
            tlv(0xA0, tlv(0x02, new byte[] { 2 })),
            tlv(0x02, serial),
            sigAlg, name,
            tlv(0x30, utcTime(now - DAY), utcTime(now + 3650 * DAY)),
            name,
            kp.getPublic().getEncoded(),
            tlv(0xA3, tlv(0x30, bc, ku, eku, san)));
        Signature s = Signature.getInstance("SHA256withECDSA");
        s.initSign(kp.getPrivate());
        s.update(tbs);
        byte[] sig = s.sign();
        byte[] bits = new byte[sig.length + 1];
        System.arraycopy(sig, 0, bits, 1, sig.length);
        return tlv(0x30, tbs, sigAlg, tlv(0x03, bits));
    }
}
