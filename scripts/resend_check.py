#!/usr/bin/env python3
"""
Check (and re-trigger) Resend domain verification for samuelbuilds.top.

    python scripts/resend_check.py          # show record status
    python scripts/resend_check.py --verify # ask Resend to re-verify, then show
"""
import json
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOMAIN = "samuelbuilds.top"


def env():
    out = {}
    for p in (ROOT / "server" / ".env", ROOT / ".env"):
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                out.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return out


KEY = env().get("RESEND_API_KEY")
if not KEY:
    sys.exit("RESEND_API_KEY missing from server/.env")

HDRS = {"Authorization": "Bearer " + KEY, "Accept": "application/json",
        "User-Agent": "curl/8.9.1", "Content-Type": "application/json"}


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request("https://api.resend.com" + path, data=data,
                                 headers=HDRS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {path} -> {e.code}: {e.read().decode()[:300]}")


domains = call("GET", "/domains")["data"]
target = next((d for d in domains if d["name"] == DOMAIN), None)
if not target:
    sys.exit(f"{DOMAIN} is not in this Resend account")

if "--verify" in sys.argv:
    call("POST", f"/domains/{target['id']}/verify", {})
    print("re-verification requested\n")

detail = call("GET", f"/domains/{target['id']}")
print(f"{DOMAIN}  status={detail['status']}\n")
bad = 0
for rec in detail.get("records", []):
    ok = rec.get("status") == "verified"
    bad += 0 if ok else 1
    print(f"  {'OK  ' if ok else 'FAIL'} {rec.get('record'):5} {rec.get('name'):22} "
          f"-> {str(rec.get('value'))[:70]}")
print()
if bad:
    print(f"{bad} record(s) still failing. Add them at Cloudflare as shown "
          f"(DNS only / grey cloud — proxied CNAMEs never verify).")
    sys.exit(1)
print("All records verified — the contact form will send.")
