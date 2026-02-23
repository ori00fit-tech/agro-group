# Agro Group — Corporate Website

> Premium corporate website for an agro-food group built with **Astro 4**, **TailwindCSS**, **TypeScript**, deployed on **Cloudflare Pages** with a **Pages Function** for the contact form and **Cloudflare Turnstile** for spam protection.

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Framework** | Astro 4 (hybrid output) |
| **Styling** | TailwindCSS v3 + @tailwindcss/typography |
| **Content** | Astro Content Collections (MDX) — News, Careers, Activities |
| **Deploy** | Cloudflare Pages from GitHub |
| **Backend** | Cloudflare Pages Functions — `/api/contact` |
| **Anti-spam** | Cloudflare Turnstile widget |
| **Email** | Resend API (or MailChannels fallback) |
| **Rate limit** | IP-based via Cloudflare KV |
| **SEO** | sitemap.xml, robots.txt, canonical, OG/Twitter, JSON-LD Organization + Breadcrumb |
| **i18n** | FR/EN structure ready (Language switcher UI) |
| **Performance** | Lazy images, preload hero, minimal JS, Lighthouse > 90 target |

---

## 🗂️ Project Structure

```
agro-group/
├── functions/
│   └── api/
│       └── contact.ts          # Cloudflare Pages Function — POST /api/contact
├── public/
│   ├── images/                 # Placeholder images (replace with real photos)
│   │   ├── activities/
│   │   └── news/
│   ├── favicon.svg
│   ├── robots.txt
│   └── _redirects
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro    # Sticky header + mega menu + mobile
│   │   │   └── Footer.astro    # Full footer + newsletter UI + socials
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── AboutTeaser.astro
│   │   │   ├── Activities.astro
│   │   │   ├── KeyFigures.astro
│   │   │   ├── Commitments.astro
│   │   │   ├── LatestNews.astro
│   │   │   └── CareersCTA.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── SectionTitle.astro
│   │   │   ├── KPI.astro       # Animated counter
│   │   │   ├── Tag.astro
│   │   │   └── Breadcrumbs.astro
│   │   └── SEOHead.astro
│   ├── content/
│   │   ├── config.ts           # Zod schemas for all collections
│   │   ├── activities/*.mdx    # 5 business units
│   │   ├── careers/*.mdx       # Job listings
│   │   └── news/*.mdx          # Press releases / news articles
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── i18n.ts             # FR/EN translation strings + useTranslations()
│   │   └── seo.ts              # SEO helpers + JSON-LD generators
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── about.astro
│   │   ├── commitments.astro
│   │   ├── contact.astro
│   │   ├── activities/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── news/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── careers/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css          # Tailwind + Google Fonts + reveal animations
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── wrangler.toml
├── .env.example
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (`npm install -g pnpm`)

### Install & Run

```bash
# 1. Clone and install
git clone https://github.com/YOUR_ORG/agro-group.git
cd agro-group
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your keys (see section below)

# 3. Start dev server
pnpm dev
# → http://localhost:4321
```

### Build for production

```bash
pnpm build
# Output → ./dist/
```

---

## 🔑 Environment Variables

Create a `.env` file at the project root (never commit it):

| Variable | Required | Description |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | ✅ | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | ✅ | Cloudflare Turnstile secret key (server-side) |
| `CONTACT_EMAIL` | ✅ | Email address receiving contact form submissions |
| `RESEND_API_KEY` | Optional | Resend.com API key (if empty, uses MailChannels) |
| `FROM_EMAIL` | Optional | Sender email address (default: `noreply@agro-group.com`) |

> **Dev shortcut**: Use `1x00000000000000000000AA` as `PUBLIC_TURNSTILE_SITE_KEY` and `1x0000000000000000000000000000000AA` as `TURNSTILE_SECRET_KEY` for local development (always passes).

---

## ☁️ Deploy to Cloudflare Pages

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/agro-group.git
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)** → **Pages** → **Create a project**
2. Select **Connect to Git** → choose your GitHub repo
3. Configure the build:

| Setting | Value |
|---|---|
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Node.js version** | `20` |
| **Install command** | `pnpm install` |

4. Under **Environment variables**, add all variables from the table above.

### Step 3: Set up KV Namespace (Rate Limiting)

```bash
# Install Wrangler
pnpm add -g wrangler

# Create KV namespace
wrangler kv:namespace create RATE_LIMIT_KV
# → Gives you an ID — add to wrangler.toml

wrangler kv:namespace create RATE_LIMIT_KV --preview
# → Gives you a preview ID — add to wrangler.toml
```

### Step 4: Custom Domain

In Cloudflare Pages → **Custom domains** → Add `agro-group.com` and `www.agro-group.com`.

---

## 📧 Email Configuration

### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key and add it as `RESEND_API_KEY`

### Option B: MailChannels (Free, no API key)

Leave `RESEND_API_KEY` empty. The function will automatically use MailChannels, which is **free on Cloudflare Workers/Pages**. You may need to add a MailChannels DNS record to your domain.

---

## 🛡️ Cloudflare Turnstile Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**
2. Click **Add site** → enter your domain
3. Copy the **Site Key** → `PUBLIC_TURNSTILE_SITE_KEY`
4. Copy the **Secret Key** → `TURNSTILE_SECRET_KEY`

---

## 🌍 Adding Content

### News article

Create `src/content/news/mon-article.mdx`:

```mdx
---
title: "Titre de l'article"
date: "2025-01-15"
excerpt: "Résumé court affiché dans les cards..."
coverImage: "/images/news/mon-image.jpg"
tags: ["Innovation", "Agriculture"]
locale: "fr"
author: "Direction Communication"
featured: false
---

# Contenu MDX complet ici

Texte, titres, tableaux, listes...
```

### Career listing

Create `src/content/careers/mon-poste.mdx`:

```mdx
---
title: "Chef de Projet Digital"
date: "2025-01-10"
excerpt: "Court résumé du poste..."
location: "Casablanca, Maroc"
type: "CDI"
department: "Digital & Innovation"
tags: ["Digital", "Management"]
locale: "fr"
active: true
---

# Description du poste
...
```

### Activity

Create `src/content/activities/nouvelle-activite.mdx`:

```mdx
---
title: "Nouvelle Activité"
excerpt: "Description courte..."
coverImage: "/images/activities/new.jpg"
icon: "🏭"
tags: ["Tag1", "Tag2"]
locale: "fr"
order: 6
color: "#e74c3c"
---

# Contenu complet MDX
...
```

---

## 🎨 Customization

### Colors

Edit `tailwind.config.mjs`:
```js
colors: {
  brand: { /* your green palette */ },
  earth: { /* your earth/warm palette */ },
}
```

### Site metadata (name, URL, contacts, socials)

Edit `src/lib/seo.ts` → `siteMeta` object.

### Translations (FR/EN)

Edit `src/lib/i18n.ts` → `ui.fr` and `ui.en` objects.

### Images

Replace the placeholder JPEGs in `public/images/` with your actual photos. Recommended sizes:

| Image | Size |
|---|---|
| `hero-bg.jpg` | 1920 × 1080 |
| `og-default.jpg` | 1200 × 630 |
| `about-teaser.jpg` | 600 × 750 |
| Activity images | 800 × 500 |
| News covers | 800 × 500 |

---

## 🔧 pnpm Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Start dev server (http://localhost:4321) |
| `pnpm build` | Production build → `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm astro` | Run Astro CLI commands |

---

## 📊 SEO & Performance

- **sitemap.xml** — auto-generated by `@astrojs/sitemap` at `/sitemap-index.xml`
- **robots.txt** — blocks `/api/*`, allows everything else
- **JSON-LD** — Organization schema on every page + Breadcrumb on inner pages
- **OG/Twitter** — Full Open Graph and Twitter Card on every page
- **Canonical** — Auto-set to current URL
- **Image optimization** — `loading="lazy"`, `decoding="async"`, explicit `width`/`height`
- **Fonts** — Served from Google Fonts with `display=swap`
- **Animations** — Respect `prefers-reduced-motion`

---

## 📝 License

MIT — Replace with your actual license before going public.
