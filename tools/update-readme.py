#!/usr/bin/env python3
"""Refreshes the version block in README.md from app/build.gradle.kts and CHANGELOG.md. Run it with every release."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
ver = re.search(r'versionName = "([^"]+)"', (root / "app/build.gradle.kts").read_text()).group(1)
log = [l for l in (root / "CHANGELOG.md").read_text().splitlines() if l.startswith("- **v")][:5]
block = "<!-- version:start -->\n**Current version: v%s**\n\n### What's new\n%s\n<!-- version:end -->" % (ver, "\n".join(log))
p = root / "README.md"
t = p.read_text()
if "<!-- version:start -->" in t:
    t = re.sub(r"<!-- version:start -->.*?<!-- version:end -->", lambda m: block, t, flags=re.S)
else:
    t = t.replace("# LocalShare\n", "# LocalShare\n\n" + block + "\n", 1)
p.write_text(t)
print("README now says v" + ver)
