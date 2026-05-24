---
name: audit-website
description: "Full health check on websites: performance, broken links, page structure, accessibility, and security headers. Triggers on 审计网站, 网站健康检查, audit website, website check. Requires target URL. NOT for: functional testing, SEO optimization, or local file analysis."
---

# Website Audit

Comprehensive website health check for performance, accessibility, security, and user experience.

## Quick Health Check

```bash
curl -I https://example.com && \
curl -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o /dev/null -s https://example.com
```

## Audit Areas

| Area | What to Check |
|------|--------------|
| **Performance** | Load time, TTFB, page size, resource analysis, Core Web Vitals |
| **Broken Links** | Crawl site, find 404s, check internal/external links |
| **Security** | HTTP headers (HSTS, CSP, X-Frame-Options), SSL certificate |
| **Accessibility** | Alt text, heading hierarchy, form labels, lang attribute |
| **SEO** | Title tag, meta description, H1, canonical tag |

## Route Table

| Topic | Reference |
|-------|-----------|
| All audit scripts (Python), report template, quick commands | [`scripts-and-report.md`](references/scripts-and-report.md) |
