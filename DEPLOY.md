# Deploying samuelbuilds.top — cPanel → Render + Cloudflare

The app is one Node web service: Express serves the built React app (`client/dist`)
**and** the `/api/*` routes. No separate static site is needed.

---

## 1. Render (one-time)

Repo: `github.com/Sammy-77A/portfolio`, branch `main`.

**Option A — Blueprint (uses `render.yaml`):**
1. Render Dashboard → **New +** → **Blueprint**
2. Connect GitHub → pick `portfolio`
3. It reads `render.yaml`: `plan: free`, `region: frankfurt`,
   build `npm run build`, start `npm start`, health check `/api/health`

**Option B — manual Web Service:**
- Runtime: **Node**
- Build command: `npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Region: Frankfurt (closest to Nairobi)

**Environment variables** (Dashboard → Environment):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `RESEND_API_KEY` | your Re_… key (never commit it) |
| `CONTACT_EMAIL` | `samuendubi321@gmail.com` |

Note: `plan: free` sleeps after 15 min idle; the first request then takes ~50 s.
Move to `starter` ($7/mo) for always-on.

**Custom domains** (Settings → Custom Domains): add `samuelbuilds.top`, then
`www.samuelbuilds.top`. Copy the service's `*.onrender.com` hostname.

---

## 2. Cloudflare

1. **Add site** → `samuelbuilds.top` → Free plan.
2. **SSL/TLS → Overview → Full** (not Flexible).
3. **DNS → Records** — recreate what is currently at cloudoon.com (truehost).
   This is the complete list as of the migration:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | `<service>.onrender.com` | DNS only |
| CNAME | `www` | `<service>.onrender.com` | DNS only |
| A | `mail` | `135.125.155.64` | DNS only |
| A | `autodiscover` | `135.125.155.64` | DNS only |
| MX | `@` | `samuelbuilds.top` (priority `0`) | – |
| TXT | `@` | `v=spf1 include:_spf.truehostcloud.com include:amazonses.com ~all` | – |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDL9zOHjs7ZUNbyOaGHBMpW+AeTJ6UNkHGqjGBe+SoCMi1aOKLEERR29C3RJN5Xm0H/h0DpR0aZnJ+0XxweEIBxewhzDsO1bp2OjIj6+2XiHiEvLIHEZg3VBbgNqaV2DhEuDH2RL8FYp+cy9F46X4xewM5zeU6dyDn9z/DJAJwMdQIDAQAB` | – |
| TXT | `_dmarc` | `v=DMARC1;p=quarantine;sp=quarantine;adkim=r;aspf=s;pct=100;fo=0;rf=afrf;ri=86400;rua=mailto:dmarc-reports@truehostcloud.com;ruf=mailto:dmarc-reports@truehostcloud.com` | – |

**Important:**
- `resend._domainkey` is what keeps the contact form's `hello@samuelbuilds.top`
  sender verified. If it is missing, Resend rejects every send.
- `mail` / `autodiscover` must be **A** records to the old cPanel IP, **not**
  CNAME → `@`. Once `@` points at Render, a CNAME chain would send mail clients
  to Render instead of the mailbox server.
- Do **not** create any `AAAA` records for `@` or `www` (Render is IPv4-only).
- Keep the old DNS zone untouched until step 4 succeeds.

4. **Nameservers** — in the Cloudflare site overview copy the two assigned
   nameservers (`*.ns.cloudflare.com`) and set them at the domain registrar
   (currently `ns1.cloudoon.com`, `ns2.cloudoon.net`, `ns3.cloudoon.org`).
   Propagation is usually minutes.
5. Back in Render: **Verify** the domains. Certificates issue once DNS resolves.
6. After Render reports the certificates as issued, you can optionally switch
   the two CNAMEs to **Proxied**. Keep SSL mode at **Full (strict)** if you do.

---

## 3. Verify after cutover

```bash
curl -s https://samuelbuilds.top/api/health
# {"status":"online","resend_ready":true}

curl -sI https://samuelbuilds.top/ | head -5
curl -sI https://samuelbuilds.top/kaazilink.webp | grep -i cache-control
curl -s -X POST https://samuelbuilds.top/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","message":"hello"}'
```

- Open the site, submit the contact form once, confirm both the notification and
  the auto-reply arrive.
- Check SPF/DKIM still pass: send to a Gmail address and inspect the headers
  (`spf=pass`, `dkim=pass`).
- `resend_ready:false` means `RESEND_API_KEY` was not picked up.

---

## 4. Old cPanel box

The SFTP scripts (`sftp_deploy.py`, `sftp_patch.py`, `upload_*.py`) and the
`SFTP_*` / `REMOTE_*` keys in `.env` only apply to the cPanel host and are no
longer part of the deploy path. They stay gitignored; delete them whenever you
are sure the migration is done.
