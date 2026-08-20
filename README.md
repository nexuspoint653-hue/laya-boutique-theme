# Laya Boutique — Shopify Theme

A custom Online Store 2.0 theme for Laya Boutique. Editorial layout, mega-menu
navigation, and product cards that play video on hover.

---

## Deploying through GitHub

Shopify syncs a **branch** to a **theme**, in both directions. Pushing a commit
updates the theme; edits made in the theme editor are committed back to the branch.

1. Push this repo to GitHub (see below).
2. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
3. Authorise the Shopify GitHub app, pick this repository and the `main` branch.
4. Shopify creates an unpublished theme bound to that branch. Preview it, then
   **Publish** when you are ready to go live.

Two rules worth remembering: one branch maps to one theme, and the same branch
should never be connected to two stores at once.

### First push

```bash
git remote add origin https://github.com/<you>/laya-boutique-theme.git
git push -u origin main
```

### Working locally

```bash
npm i -g @shopify/cli
shopify theme dev --store 4d6bp2-sy.myshopify.com   # live reload preview
shopify theme check                                  # lint before pushing
```

---

## Structure

```
layout/theme.liquid          Document shell, fonts, colour variables
sections/                    Every homepage and template section
snippets/product-card.liquid The hover-video product card
assets/laya.css              All styling
assets/laya.js               Hover video, mega menu, drawers, reveals
templates/*.json             Which sections each template renders
config/settings_schema.json  Theme settings exposed in the editor
```

## Sections

| Section | Purpose |
| --- | --- |
| `hero-video` | Full-bleed hero. Takes a video, an external mp4 URL, or an image. |
| `featured-collection` | Eyebrow + heading + product grid, 2–4 columns. |
| `category-tiles` | Up to four portrait tiles linking to collections. |
| `split-panel` | Half image, half copy. Light, tinted or dark; image either side. |
| `product-rail` | Horizontal scrolling product carousel with arrows. |
| `editorial-banner` | Full-bleed image with centred copy. |
| `shop-the-look` | A curated set of products shown together. |
| `service-band` | Three-column band of service messaging. |

## How the mega menu works

The header reads your Shopify navigation directly. A top-level menu item's
children become the flyout's columns; their children become the links inside
each column. Add a menu item in **Navigation** and the flyout updates — no code.

The editorial image beside each flyout is set per menu position in the theme
editor, under **Header → Menu image**.

## How the hover video works

If a product has a video in its media, the card plays it on hover: it fades in
at quarter speed and eases up to full speed over 1.5s, then slows and fades back
to the still when the cursor leaves. If there is no video, the card crossfades
to the product's second image instead.

Nothing needs configuring — upload a video to a product and the card picks it up.
Respects `prefers-reduced-motion` and is disabled on touch devices.

## Theme settings

Five colours drive the whole palette: page background, text, accent, mega-menu
background, and dark panels. Set them under **Theme settings → Colours**.

## Content this theme expects

- Collections for abayas, dresses, sets and accessories
- A main menu nested two levels deep, for the flyouts
- Footer menus for the four footer columns
- Pages for privacy policy, terms, social media policy, shipping and size guide
