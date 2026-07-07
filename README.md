# Jenny Faye Alipen — Personal Brand Website

Premium portfolio website for **Jenny Faye Alipen**, Customer Success & Operations Specialist (Iloilo City, Philippines).

Built as a fast, dependency-free static site: pure HTML, CSS, and vanilla JavaScript. No build step required.

## Structure

```
index.html        — single-page site (hero, about, expertise, experience, testimonials, FAQ, contact)
css/style.css     — design system (General Sans + Manrope, pink accent #E91E63)
js/main.js        — scroll reveals, stat counters, mobile nav
assets/           — photo + downloadable resume
```

## Local preview

Open `index.html` directly in a browser, or serve it:

```bash
npx serve .
# or
python -m http.server 8000
```

## Deployment — Cloudflare Pages

This repo is designed for Cloudflare Pages (static, no build):

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the `jenzidol/jenzportfolio` repository.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Click **Save and Deploy**. Every push to `main` auto-deploys.

Alternatively, deploy from the command line with Wrangler:

```bash
npx wrangler pages deploy . --project-name=jenzportfolio
```
