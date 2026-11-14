import com.localshare.app.server.MdnsResponder;
import java.net.*;
import java.util.*;

public class MdnsTest {
    public static void main(String[] a) throws Exception {
        if (!MdnsResponder.clean("DEMON GOD!").equals("demon-god") || !MdnsResponder.clean("  ").equals("localshare")) throw new Error("clean");
        MdnsResponder r = new MdnsResponder("DEMON GOD", Arrays.asList("192.168.1.7", "10.0.0.2"), 15353);
        r.start();
        DatagramSocket c = new DatagramSocket();
        c.setSoTimeout(2000);
        byte[] q = query("demon-god.local", 1);
        c.send(new DatagramPacket(q, q.length, InetAddress.getLoopbackAddress(), 15353));
        byte[] b = new byte[512];
        DatagramPacket p = new DatagramPacket(b, b.length);
        c.receive(p);
        int an = ((b[6] & 255) << 8) | (b[7] & 255);
        int last = p.getLength();
        if (an != 2 || (b[last - 4] & 255) != 10 || (b[last - 1] & 255) != 2) throw new Error("reply " + an);
        byte[] o = query("other.local", 1);
        c.send(new DatagramPacket(o, o.length, InetAddress.getLoopbackAddress(), 15353));
        try { c.receive(new DatagramPacket(b, b.length)); throw new Error("answered a foreign name"); } catch (SocketTimeoutException ok) { }
        r.stop();
        System.out.println("MdnsTest ok " + r.host());
    }

    static byte[] query(String host, int type) {
        java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream();
        o.write(0x12); o.write(0x34); o.write(0); o.write(0); o.write(0); o.write(1); for (int i = 0; i < 6; i++) o.write(0);
        for (String l : host.split("\\.")) { o.write(l.length()); o.write(l.getBytes(), 0, l.length()); }
        o.write(0); o.write(0); o.write(type); o.write(0); o.write(1);
        return o.toByteArray();
    }
}
