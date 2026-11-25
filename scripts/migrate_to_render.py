#!/usr/bin/env python3
"""
One-shot migration: Render web service + Cloudflare DNS/zone for samuelbuilds.top.

Reads tokens from the repo .env (never prints them):
    RENDER_API_KEY
    CLOUDFLARE_API_TOKEN
    CLOUDFLARE_ACCOUNT_ID   (optional; auto-detected if omitted)
    RESEND_API_KEY          (already in server/.env)

Usage:
    python scripts/migrate_to_render.py --dry-run      # show the plan only
    python scripts/migrate_to_render.py --render-only  # Render only, print CF steps
    python scripts/migrate_to_render.py                # Render + Cloudflare

Idempotent: re-running updates the service / upserts DNS records instead of
creating duplicates.
"""
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
RENDER_API = "https://api.render.com/v1"
CF_API = "https://api.cloudflare.com/client/v4"

DOMAIN = "samuelbuilds.top"
WWW = "www." + DOMAIN
SERVICE_NAME = "portfolio"
REPO = "https://github.com/Sammy-77A/portfolio"
BRANCH = "main"

# Records that must survive the nameserver move (captured from the live zone).
# The two CNAMEs are filled in once Render handss us the onrender.com hostname.
STATIC_RECORDS = [
    ("A", "mail", "135.125.155.64", None),
    ("A", "autodiscover", "135.125.155.64", None),
    ("MX", DOMAIN, DOMAIN, 0),
    ("TXT", DOMAIN, "v=spf1 include:_spf.truehostcloud.com include:amazonses.com ~all", None),
    ("TXT", "resend._domainkey",
     "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDL9zOHjs7ZUNbyOaGHBMpW+AeTJ6UNkHGqj"
     "GBe+SoCMi1aOKLEERR29C3RJN5Xm0H/h0DpR0aZnJ+0XxweEIBxewhzDsO1bp2OjIj6+2XiHiEvLIH"
     "EZg3VBbgNqaV2DhEuDH2RL8FYp+cy9F46X4xewM5zeU6dyDn9z/DJAJwMdQIDAQAB", None),
    ("TXT", "_dmarc",
     "v=DMARC1;p=quarantine;sp=quarantine;adkim=r;aspf=s;pct=100;fo=0;rf=afrf;ri=86400;"
     "rua=mailto:dmarc-reports@truehostcloud.com;ruf=mailto:dmarc-reports@truehostcloud.com",
     None),
]

DRY = "--dry-run" in sys.argv
RENDER_ONLY = "--render-only" in sys.argv


def load_env():
    env = {}
    for name in (ROOT / ".env", ROOT / "server" / ".env"):
        if not name.exists():
            continue
        for line in name.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def call(method, url, token, body=None, bearer=True):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = ("Bearer " if bearer else "Bearer ") + token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:800]
        raise RuntimeError(f"{method} {url} -> HTTP {e.code}: {detail}") from None


# --------------------------------------------------------------------------
# Render
# --------------------------------------------------------------------------
def render(token):
    def r(method, path, body=None):
        return call(method, RENDER_API + path, token, body)

    owners = r("GET", "/owners")
    owner = owners[0]["owner"] if isinstance(owners, list) else owners["owner"]
    owner_id = owner["id"]
    print(f"  owner: {owner.get('name', owner_id)} ({owner_id})")

    services = [o["service"] if "service" in o else o for o in r("GET", "/services?limit=100")]
    svc = next((s for s in services if s.get("name") == SERVICE_NAME), None)

    env_vars = [
        {"key": "NODE_ENV", "value": "production"},
        {"key": "CONTACT_EMAIL", "value": "samuendubi321@gmail.com"},
    ]
    if ENV.get("RESEND_API_KEY"):
        env_vars.append({"key": "RESEND_API_KEY", "value": ENV["RESEND_API_KEY"]})
    else:
        print("  !! RESEND_API_KEY missing from server/.env — contact form will not send")

    details = {
        "env": "node",
        "plan": "free",
        "region": "frankfurt",
        "healthCheckPath": "/api/health",
        "envSpecificDetails": {
            "buildCommand": "npm run build",
            "startCommand": "npm start",
            "preDeployCommand": "",
        },
    }

    if svc:
        sid = svc["id"]
        print(f"  service exists: {sid} ({svc.get('serviceDetails', {}).get('url', '')})")
        if not DRY:
            r("PATCH", f"/services/{sid}", {"serviceDetails": details, "envVars": env_vars})
            print("  updated plan/build/start/env vars")
    else:
        payload = {
            "type": "web_service",
            "name": SERVICE_NAME,
            "ownerId": owner_id,
            "repo": REPO,
            "branch": BRANCH,
            "autoDeploy": "yes",
            "envVars": env_vars,
            "serviceDetails": details,
        }
        if DRY:
            print("  would create web service with:")
            print("   ", json.dumps({k: v for k, v in payload.items() if k != "envVars"}))
            return None, []
        created = r("POST", "/services", payload)
        sid = created["service"]["id"] if "service" in created else created["id"]
        print(f"  created service: {sid}")

    # wait for the first deploy to go live
    host = None
    for attempt in range(60):
        d = r("GET", f"/services/{sid}")
        s = d.get("service", d)
        host = (s.get("serviceDetails") or {}).get("url") or host
        dep = r("GET", f"/services/{sid}/deploys?limit=1")
        row = dep[0] if isinstance(dep, list) else dep
        st = (row.get("deploy") or row or {}).get("status", "?")
        print(f"  deploy status: {st}  host: {host}")
        if st in ("live", "build_failed", "update_failed", "canceled", "deactivated"):
            break
        time.sleep(10)
    if not host:
        raise RuntimeError("service URL unknown; check the Render dashboard")

    # custom domains (apex + www)
    domains = r("GET", f"/services/{sid}/custom-domains")
    rows = [d.get("customDomain", d) for d in domains] if isinstance(domains, list) else []
    have = {d.get("name") for d in rows if isinstance(d, dict)}
    for name in (DOMAIN, WWW):
        if name in have:
            print(f"  domain already attached: {name}")
            continue
        if DRY:
            print(f"  would attach domain: {name}")
            continue
        try:
            r("POST", f"/services/{sid}/custom-domains", {"name": name})
            print(f"  attached domain: {name}")
        except RuntimeError as e:
            print(f"  !! could not attach {name}: {e}")

    return host, [sid]


# --------------------------------------------------------------------------
# Cloudflare
# --------------------------------------------------------------------------
def cloudflare(token, render_host):
    def c(method, path, body=None):
        resp = call(method, CF_API + path, token, body)
        if not resp.get("success", False):
            raise RuntimeError(f"{method} {path} failed: {json.dumps(resp.get('errors'))}")
        return resp["result"]

    account_id = ENV.get("CLOUDFLARE_ACCOUNT_ID")
    if not account_id:
        accounts = c("GET", "/accounts?per_page=1")
        if not accounts:
            raise RuntimeError("no Cloudflare account visible to this token")
        account_id = accounts[0]["id"]
    print(f"  account: {account_id}")

    zones = [z for z in c("GET", f"/zones?name={DOMAIN}") if z["name"] == DOMAIN]
    if zones:
        zone = zones[0]
        print(f"  zone exists: {zone['id']} (status {zone['status']})")
    elif DRY:
        print(f"  would create zone {DOMAIN}")
        zone = {"id": "dry", "name_servers": ["(assigned on create)"]}
    else:
        zone = c("POST", "/zones", {"name": DOMAIN, "account": {"id": account_id}, "type": "full"})
        print(f"  created zone {zone['id']}")

    zone_id = zone["id"]

    # SSL mode -> Full
    if not DRY and zone_id != "dry":
        try:
            c("PATCH", f"/zones/{zone_id}/settings/ssl", {"value": "full"})
            print("  SSL/TLS mode: full")
        except RuntimeError as e:
            print(f"  !! SSL mode not set: {e}")

    records = [
        ("CNAME", DOMAIN, render_host, None),
        ("CNAME", WWW, render_host, None),
    ] + STATIC_RECORDS

    existing = [] if DRY else c("GET", f"/zones/{zone_id}/dns_records?per_page=100")
    for rtype, name, content, priority in records:
        label = f"{rtype:6} {name:26} -> {content[:60]}"
        if DRY:
            print(f"  would upsert: {label}")
            continue
        match = next((r for r in existing
                      if r["type"] == rtype and r["name"] == name), None)
        body = {"type": rtype, "name": name, "content": content, "ttl": 1, "proxied": False}
        if priority is not None:
            body["priority"] = priority
        if rtype in ("CNAME",):
            body.pop("proxied", None)
            body["proxied"] = False
        try:
            if match:
                c("PUT", f"/zones/{zone_id}/dns_records/{match['id']}", body)
                print(f"  updated: {label}")
            else:
                c("POST", f"/zones/{zone_id}/dns_records", body)
                print(f"  created: {label}")
        except RuntimeError as e:
            print(f"  !! {label}: {e}")

    ns = zone.get("name_servers") or []
    return zone_id, ns


def write_cf_steps(render_host):
    """Emit the exact Cloudflare record set, filled in with the real host."""
    rows = [
        ("CNAME", "@", render_host, "DNS only", "-> Render service"),
        ("CNAME", "www", render_host, "DNS only", "-> Render service"),
    ]
    for rtype, name, content, priority in STATIC_RECORDS:
        rows.append((rtype, "@" if name == DOMAIN else name,
                     content + (f"  (priority {priority})" if priority is not None else ""),
                     "DNS only", "mail / Resend"))
    lines = [
        "Cloudflare setup for samuelbuilds.top",
        "=" * 60,
        "",
        "1. dash.cloudflare.com -> Add a site -> samuelbuilds.top -> Free plan",
        "2. SSL/TLS -> Overview -> set mode to FULL  (not Flexible)",
        "3. DNS -> Records -> add each record below, Proxy status = DNS only.",
        "   Do NOT create any AAAA record for @ or www (Render is IPv4-only).",
        "",
    ]
    for rtype, name, content, proxy, note in rows:
        lines.append(f"   {rtype:5} | {name:16} | {content}")
        lines.append(f"   {'':5} | {'':16} | {proxy}, {note}")
    lines += [
        "",
        "4. Copy the two Cloudflare nameservers from the zone Overview page and set",
        "   them at the registrar (now ns1.cloudoon.com / ns2.cloudoon.net /",
        "   ns3.cloudoon.org). Propagation is usually a few minutes.",
        "5. In Render -> portfolio -> Settings -> Custom Domains, click Verify on both.",
        "6. Once Render shows the certificates as issued, you may switch the two",
        "   CNAMEs to Proxied (keep SSL at Full (strict)).",
        "",
        "7. Verify:",
        f"   curl -s https://{render_host}/api/health   # before DNS moves",
        "   curl -s https://samuelbuilds.top/api/health  # after DNS moves",
    ]
    out = ROOT / "cloudflare-setup.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"  wrote {out}")


def main():
    global ENV
    ENV = load_env()
    if not ENV.get("RENDER_API_KEY"):
        sys.exit(f"missing RENDER_API_KEY in {ROOT / '.env'}")
    if not (RENDER_ONLY or ENV.get("CLOUDFLARE_API_TOKEN")):
        print("no CLOUDFLARE_API_TOKEN — Render only; Cloudflare steps go to")
        print("cloudflare-setup.txt\n")

    if DRY:
        print("DRY RUN — nothing will be created or changed\n")

    print("[1/2] Render")
    host, _ = render(ENV["RENDER_API_KEY"])
    if DRY or not host:
        host = "portfolio.onrender.com"
    host = host.replace("https://", "").replace("http://", "").rstrip("/")
    print(f"  frontend host: {host}\n")

    if RENDER_ONLY or not ENV.get("CLOUDFLARE_API_TOKEN"):
        print("[2/2] Cloudflare — skipped (no token), writing the steps instead")
        write_cf_steps(host)
        return

    print("[2/2] Cloudflare")
    zone_id, ns = cloudflare(ENV["CLOUDFLARE_API_TOKEN"], host)

    print("\nDone. Remaining manual step:")
    print("  Set these nameservers at the registrar (currently ns*.cloudoon.*):")
    for n in ns or ["(open the Cloudflare zone overview to read them)"]:
        print(f"    {n}")
    print("\nThen verify:")
    print("  curl -s https://samuelbuilds.top/api/health")


if __name__ == "__main__":
    main()
