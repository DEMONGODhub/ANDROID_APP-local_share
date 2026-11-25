//! Pure, dependency-free helpers. None of them touch the file-streaming path,
//! so enabling this crate can never slow a transfer down.

/// Normalise a request path. Returns None if it escapes the root (`..`), has a NUL, or a backslash.
pub fn normalize_path(p: &str) -> Option<String> {
    if p.contains('\0') || p.contains('\\') {
        return None;
    }
    let mut out: Vec<&str> = Vec::new();
    for seg in p.split('/') {
        match seg {
            "" | "." => {}
            ".." => {
                out.pop()?;
            }
            s => out.push(s),
        }
    }
    Some(out.join("/"))
}

/// Guess a MIME type from the first bytes of a file.
pub fn sniff_mime(b: &[u8]) -> &'static str {
    match b {
        [0x89, b'P', b'N', b'G', ..] => "image/png",
        [0xFF, 0xD8, 0xFF, ..] => "image/jpeg",
        [b'G', b'I', b'F', b'8', ..] => "image/gif",
        [b'%', b'P', b'D', b'F', ..] => "application/pdf",
        [b'P', b'K', 3, 4, ..] => "application/zip",
        [b'I', b'D', b'3', ..] => "audio/mpeg",
        [b'R', b'I', b'F', b'F', _, _, _, _, b'W', b'E', b'B', b'P', ..] => "image/webp",
        [b'f', b'L', b'a', b'C', ..] => "audio/flac",
        [b'O', b'g', b'g', b'S', ..] => "audio/ogg",
        _ => "application/octet-stream",
    }
}

/// Find the cover picture (APIC frame) of an ID3v2.3/2.4 tag. Returns (mime, bytes).
pub fn id3_cover(d: &[u8]) -> Option<(String, &[u8])> {
    if d.len() < 10 || &d[0..3] != b"ID3" || !(d[3] == 3 || d[3] == 4) {
        return None;
    }
    let size = d[6..10].iter().try_fold(0usize, |a, &b| if b & 0x80 != 0 { None } else { Some(a << 7 | b as usize) })?;
    let end = (10 + size).min(d.len());
    let mut i = 10;
    while i + 10 <= end {
        let id = &d[i..i + 4];
        if id[0] == 0 {
            break;
        }
        let raw = &d[i + 4..i + 8];
        let fs = if d[3] == 4 {
            raw.iter().try_fold(0usize, |a, &b| if b & 0x80 != 0 { None } else { Some(a << 7 | b as usize) })?
        } else {
            u32::from_be_bytes([raw[0], raw[1], raw[2], raw[3]]) as usize
        };
        let (s, e) = (i + 10, i + 10 + fs);
        if e > end {
            return None;
        }
        if id == b"APIC" {
            let f = &d[s..e];
            let enc = *f.first()?;
            let m_end = 1 + f[1..].iter().position(|&b| b == 0)?;
            let mime = String::from_utf8_lossy(&f[1..m_end]).to_string();
            let mut p = m_end + 2; // NUL + picture type
            // description: NUL terminated, or double-NUL for UTF-16
            if enc == 1 || enc == 2 {
                while p + 1 < f.len() && !(f[p] == 0 && f[p + 1] == 0) {
                    p += 2;
                }
                p += 2;
            } else {
                while p < f.len() && f[p] != 0 {
                    p += 1;
                }
                p += 1;
            }
            if p > f.len() {
                return None;
            }
            return Some((mime, &f[p..]));
        }
        i = e;
    }
    None
}

/// C ABI so any language (Java via JNI shim, Kotlin, Python) can call it. 1 = path is safe.
#[no_mangle]
pub extern "C" fn ls_path_is_safe(p: *const u8, len: usize) -> i32 {
    if p.is_null() {
        return 0;
    }
    let s = unsafe { std::slice::from_raw_parts(p, len) };
    match std::str::from_utf8(s) {
        Ok(t) => normalize_path(t).is_some() as i32,
        Err(_) => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn paths() {
        assert_eq!(normalize_path("a/./b//c").as_deref(), Some("a/b/c"));
        assert_eq!(normalize_path("a/b/../c").as_deref(), Some("a/c"));
        assert!(normalize_path("../etc/passwd").is_none());
        assert!(normalize_path("a/../../x").is_none());
        assert!(normalize_path("a\\b").is_none());
        assert!(normalize_path("a\0b").is_none());
        assert_eq!(normalize_path("/").as_deref(), Some(""));
    }

    #[test]
    fn mime() {
        assert_eq!(sniff_mime(b"\x89PNG\r\n"), "image/png");
        assert_eq!(sniff_mime(b"%PDF-1.7"), "application/pdf");
        assert_eq!(sniff_mime(b"RIFF\0\0\0\0WEBPVP8"), "image/webp");
        assert_eq!(sniff_mime(b"zzz"), "application/octet-stream");
        assert_eq!(sniff_mime(b""), "application/octet-stream");
    }

    fn tag(ver: u8, enc: u8, desc: &[u8], pic: &[u8]) -> Vec<u8> {
        let mut f = vec![enc];
        f.extend(b"image/jpeg\0");
        f.push(3);
        f.extend(desc);
        f.extend(pic);
        let n = f.len();
        let mut fr = b"APIC".to_vec();
        if ver == 4 {
            fr.extend([(n >> 21 & 127) as u8, (n >> 14 & 127) as u8, (n >> 7 & 127) as u8, (n & 127) as u8]);
        } else {
            fr.extend((n as u32).to_be_bytes());
        }
        fr.extend([0, 0]);
        fr.extend(f);
        let t = fr.len();
        let mut d = vec![b'I', b'D', b'3', ver, 0, 0, (t >> 21 & 127) as u8, (t >> 14 & 127) as u8, (t >> 7 & 127) as u8, (t & 127) as u8];
        d.extend(fr);
        d
    }

    #[test]
    fn cover() {
        let pic = [0xFF, 0xD8, 0xFF, 1, 2, 3];
        for ver in [3u8, 4] {
            let d = tag(ver, 0, b"cover\0", &pic);
            let (m, b) = id3_cover(&d).unwrap();
            assert_eq!(m, "image/jpeg");
            assert_eq!(b, &pic);
        }
        let d = tag(3, 1, &[0xFF, 0xFE, b'a', 0, 0, 0], &pic);
        assert_eq!(id3_cover(&d).unwrap().1, &pic);
        assert!(id3_cover(b"nope").is_none());
        assert!(id3_cover(&d[..20]).is_none()); // truncated: no panic
    }

    #[test]
    fn ffi() {
        assert_eq!(ls_path_is_safe(b"a/b".as_ptr(), 3), 1);
        assert_eq!(ls_path_is_safe(b"../x".as_ptr(), 4), 0);
        assert_eq!(ls_path_is_safe(std::ptr::null(), 0), 0);
    }
}
