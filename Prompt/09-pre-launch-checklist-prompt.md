# Pre-Launch Website Checklist — Audit Prompt Template

> **Cara pakai:** Ganti `[WEBSITE_URL]` dengan URL websitemu, lalu paste seluruh prompt ini ke IDE atau Claude.

---

## PROMPT

```
You are performing a pre-launch audit for [WEBSITE_URL].

Scan the live site AND the codebase, then verify every item in the checklist below.
For each item, output its status as:
- ✅ DONE — confirmed working
- ❌ MISSING — not found or not configured
- ⚠️ PARTIAL — exists but incomplete or misconfigured
- N/A — not applicable for this project type

After the full audit table, output a **Prioritized Fix List** — sorted most critical first — with the exact file path and code change needed for each ❌ or ⚠️ item.

---

## CHECKLIST

### 🌐 Website
- [ ] Landing page is live and accessible
- [ ] Open Graph tags set: og:title, og:description, og:image, og:url
- [ ] Twitter Card tags set: twitter:card, twitter:title, twitter:image
- [ ] og:image is a high-quality image (recommended 1200x630px), not a placeholder
- [ ] Favicon configured and displaying correctly
- [ ] Mobile responsive (viewport meta tag present + layout tested)
- [ ] SSL certificate active (site loads on https://)
- [ ] Primary CTA / Download / Buy button is wired and functional
- [ ] No broken links on main pages

### 🔍 SEO
- [ ] Meta title set (ideally unique per page, not just root layout)
- [ ] Meta description set (ideally unique per page)
- [ ] Canonical URL configured (consistent www vs non-www)
- [ ] robots.txt exists and is accessible at /robots.txt
- [ ] sitemap.xml exists and is accessible at /sitemap.xml
- [ ] Sitemap submitted to Google Search Console
- [ ] Google Search Console connected and verified
- [ ] Bing Webmaster Tools connected and verified
- [ ] IndexNow configured (for faster Bing/Yandex indexing)
- [ ] Structured data / JSON-LD present (Organization schema minimum)
- [ ] No pages accidentally marked noindex

### ⚖️ Legal
- [ ] Privacy Policy page exists and is linked in footer
- [ ] Terms of Service page exists and is linked in footer
- [ ] Data handling documented in Privacy Policy (what data is collected, why, how long)
- [ ] GDPR compliance implemented (if applicable — EU audience or EU-based)
- [ ] Cookie consent notice present (required if using analytics, pixels, or any tracking)

### 📣 Marketing
- [ ] Launch post drafted and ready
- [ ] Social media assets ready (images sized correctly per platform, captions written)
- [ ] Email list notified (if applicable)
- [ ] Product Hunt listing prepared (if applicable)
- [ ] Friends / community briefed and ready to support on launch day

---

## CONTEXT
- Site URL: [WEBSITE_URL]
- Stack: [e.g. Next.js 15, TypeScript, Tailwind CSS 4]
- Project type: [e.g. SaaS landing page / e-commerce / portfolio / web app]
- Domain registrar: [e.g. Hostinger / Namecheap / Cloudflare]
- Hosting: [e.g. Vercel / Netlify / Railway]
- Tracking scripts in use: [e.g. None / Google Analytics / Meta Pixel]
- Target audience region: [e.g. Indonesia / Global / EU]

For the fix list, prioritize in this order:
1. SSL + site accessibility (site must be reachable)
2. OG tags + og:image (critical for social sharing)
3. robots.txt + sitemap.xml
4. Canonical URL
5. Privacy Policy + Terms pages + footer links
6. Cookie notice (only if tracking is confirmed)
7. Structured data (JSON-LD)
8. GSC + Bing verification
9. Marketing assets
```

---

## Catatan Penggunaan

**Ganti sebelum pakai:**
- `[WEBSITE_URL]` → URL lengkap websitemu, contoh: `https://www.moemacollection.com`
- `[e.g. Next.js 15...]` → stack teknologi proyekmu
- `[e.g. SaaS...]` → tipe proyekmu
- `[e.g. Hostinger...]` → registrar domainmu
- `[e.g. Vercel...]` → platform hosting-mu
- `[e.g. None...]` → tracking apa yang kamu pakai
- `[e.g. Indonesia...]` → target audience-mu

**Tips:**
- Untuk Next.js projects, IDE akan scan `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`
- Kalau tidak ada tracking sama sekali → cookie notice bisa di-skip
- GDPR hanya wajib kalau ada pengunjung dari EU atau bisnis berbasis di EU
- Marketing section bisa di-skip kalau audit hanya untuk technical readiness
