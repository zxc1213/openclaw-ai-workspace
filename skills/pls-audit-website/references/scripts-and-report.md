# Audit Scripts & Report Template

## Performance Audit

### Page Load Time
```bash
curl -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nSSL: %{time_appconnect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\nSize: %{size_download} bytes\n" -o /dev/null -s https://example.com

npx lighthouse https://example.com --only-categories=performance --output=json
```

### Resource Analysis
```python
import requests
from bs4 import BeautifulSoup

def analyze_resources(url):
    response = requests.get(url)
    resources = []
    soup = BeautifulSoup(response.text, 'html.parser')
    
    for img in soup.find_all('img'):
        resources.append({'type': 'image', 'url': img.get('src')})
    for script in soup.find_all('script', src=True):
        resources.append({'type': 'script', 'url': script.get('src')})
    for link in soup.find_all('link', rel='stylesheet'):
        resources.append({'type': 'stylesheet', 'url': link.get('href')})
    return resources
```

### Core Web Vitals
```bash
npx web-vitals https://example.com
# LCP < 2.5s, FID < 100ms, CLS < 0.1
```

## Broken Link Checker
```python
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def find_broken_links(base_url, max_depth=2):
    visited, broken = set(), []
    def check_page(url, depth):
        if depth > max_depth or url in visited: return
        visited.add(url)
        try:
            r = requests.get(url, timeout=10)
            if r.status_code >= 400:
                broken.append({'url': url, 'status': r.status_code})
                return
            soup = BeautifulSoup(r.text, 'html.parser')
            for link in soup.find_all('a', href=True):
                href = urljoin(url, link['href'])
                if urlparse(href).netloc == urlparse(base_url).netloc:
                    check_page(href, depth + 1)
        except Exception as e:
            broken.append({'url': url, 'error': str(e)})
    check_page(base_url, 0)
    return broken
```

```bash
# Quick link check
wget --spider -r -l 2 https://example.com 2>&1 | grep -E "(broken|failed|error)"
pip install LinkChecker && linkchecker https://example.com
```

## Security Audit
```python
def audit_security_headers(url):
    r = requests.head(url)
    recommended = {
        'Strict-Transport-Security': 'Enable HSTS',
        'X-Content-Type-Options': 'Set to nosniff',
        'X-Frame-Options': 'Set to DENY or SAMEORIGIN',
        'Content-Security-Policy': 'Define CSP',
        'X-XSS-Protection': 'Enable XSS filter',
        'Referrer-Policy': 'Set referrer policy',
        'Permissions-Policy': 'Define permissions'
    }
    return {"present": {h: r.headers.get(h) for h in recommended if h in r.headers},
            "missing": [f"Missing {h}: {r}" for h, r in recommended.items() if h not in r.headers]}
```

```bash
# SSL check
openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates
```

## Accessibility Audit
```python
def accessibility_audit(html):
    from bs4 import BeautifulSoup
    soup, issues = BeautifulSoup(html, 'html.parser'), []
    for img in soup.find_all('img'):
        if not img.get('alt'): issues.append(f"Image missing alt: {img.get('src', 'unknown')}")
    if not soup.find('html', lang=True): issues.append("Missing lang attribute on <html>")
    prev = 0
    for h in soup.find_all(['h1','h2','h3','h4','h5','h6']):
        level = int(h.name[1])
        if level > prev + 1: issues.append(f"Skipped heading level: h{prev} to h{level}")
        prev = level
    return issues
```

```bash
npx axe-cli https://example.com
npx pa11y https://example.com
```

## SEO Quick Check
```python
def seo_quick_check(html):
    from bs4 import BeautifulSoup
    soup, issues = BeautifulSoup(html, 'html.parser'), []
    title = soup.find('title')
    if not title: issues.append("Missing <title> tag")
    elif len(title.text) < 30 or len(title.text) > 60: issues.append(f"Title length suboptimal: {len(title.text)} chars")
    if not soup.find('meta', attrs={'name': 'description'}): issues.append("Missing meta description")
    h1s = soup.find_all('h1')
    if len(h1s) != 1: issues.append(f"Expected 1 H1 tag, found {len(h1s)}")
    if not soup.find('link', rel='canonical'): issues.append("Missing canonical tag")
    return issues
```

## Report Template

```markdown
# Website Audit Report
**URL:** https://example.com | **Date:** YYYY-MM-DD | **Overall Score:** X/100

## Performance
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Load Time | 3.2s | <3s | ⚠️ |

## Security
| Header | Status |
|--------|--------|

## Accessibility
- Images missing alt: 3
- Form inputs missing labels: 2

## SEO
- Title: ✅ 52 chars
- Meta description: ❌ Missing

## Broken Links
- /old-page (404)

## Recommendations
1. Add missing security headers
2. Optimize images
3. Fix broken links
```

## Quick Commands
| Check | Command |
|-------|---------|
| Response headers | `curl -I URL` |
| Load timing | `curl -w "%{time_total}s" -o /dev/null -s URL` |
| SSL check | `openssl s_client -connect HOST:443` |
| Broken links | `linkchecker URL` |
| Accessibility | `npx pa11y URL` |
| Performance | `npx lighthouse URL` |
