# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Voyage Lumière** is a static HTML/CSS/JS travel blog in Spanish targeting Mexican and Latin American travelers visiting Europe. It is deployed on GitHub Pages at `voyagelumiere.indevs.in` (configured via `CNAME`).

There is no build system, package manager, or framework — files are served as-is. To preview locally, open any `.html` file directly in a browser or use a simple static server (e.g. `python -m http.server`).

## File structure

```
/                    ← root pages (homepage, legal, about)
/articles/           ← one .html file per destination or topic
/css/style.css       ← reference/design copy only — NOT linked from any HTML file
/sitemap.xml         ← must be updated manually when adding a new article
/robots.txt          ← noindex on: privacidad, cookies, aviso-legal, afiliados
/CNAME               ← GitHub Pages custom domain
```

## Page architecture

Every HTML file is self-contained: all CSS lives in a `<style id="critical-css">` block inside `<head>`, and all JavaScript is inline at the bottom of `<body>`. There are no external JS or CSS files loaded from this repo.

### Two page templates

**Root pages** (`index.html`, `sobre-nosotros.html`, legal pages):
- Paths to articles use `articles/filename.html`

**Article pages** (`articles/*.html`):
- Layout: fixed nav → hero → two-column (main content + sidebar) → footer
- Paths back to root use `../filename.html`
- The sidebar contains affiliate booking widgets (GetYourGuide, Tiqets, Booking, Kiwi, Omio)

### Shared UI patterns (duplicated across every file)
- **Nav**: fixed, adds `.scrolled` class on scroll via JS; mobile hamburger toggles `.open` on `#navLinks`
- **Cookie banner**: `#cookieBanner`, persisted via `localStorage` (`cookieConsent` key)
- **Scroll reveal**: `IntersectionObserver` adds `.visible` to `.reveal` elements
- **Footer**: 4-column grid (brand, destinations, categories, about)

## Design system

CSS custom properties defined in every file's `:root`:

| Variable | Value | Use |
|---|---|---|
| `--navy` | `#1A2B4C` | Primary brand, headings |
| `--gold` | `#C5A059` | Accent, CTAs |
| `--cream` | `#FDFBF7` | Page background |
| `--gold-lt` | `#E8D5A3` | Hover states |

Fonts: `Playfair Display` (headings), `Lato` (body), `Cormorant Garamond` (accent/italic). Loaded non-blocking via `<link rel="preload" as="style" onload="...">` in every file's `<head>`.

## Affiliate partner IDs

All affiliate links must use these exact IDs — never use placeholders:

| Partner | ID / code |
|---|---|
| GetYourGuide | `data-gyg-partner-id="1ABLZMR"` |
| Tiqets | `partner=voyage_lumiere-184870` |
| Omio | `omio.sjv.io/c/7062459/1698061/7385` |
| Booking.com (Awin) | `awinaffid=2802340` |
| Kiwi.com (Awin) | `r=2802340` |

The GetYourGuide widget script must appear just before `</body>`:
```html
<script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="1ABLZMR"></script>
```

Omio affiliate links include an invisible tracking pixel (`height="0" width="0"`) that must have `alt=""`.

## Analytics

- Google Analytics: `G-52MYXE4VXP` (loaded deferred on `window load` event)
- Google AdSense: `ca-pub-4594535933040491`

## Adding a new article

1. Copy an existing article file from `articles/` as the starting template.
2. Update `<title>`, `<meta name="description">`, `<meta name="keywords">`, and `<link rel="canonical">`.
3. Add the new URL to `sitemap.xml` with an appropriate `<priority>` and today's date as `<lastmod>`.
4. Link to the new article from `index.html` (article cards grid) and any relevant footer nav columns.
