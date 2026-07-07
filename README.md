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

## Contact form (Resend)

The contact form posts to `/api/contact`, a Cloudflare Pages Function
([functions/api/contact.js](functions/api/contact.js)) that emails submissions
via [Resend](https://resend.com). One-time setup:

1. Sign up at resend.com **using jennyalipenworks@gmail.com** — the address
   form submissions are delivered to. (On the free tier without a verified
   domain, Resend only delivers to the account owner's own address — signing
   up with the destination Gmail makes it work immediately, no domain needed.)
2. In Resend: **API Keys** → **Create API Key** (sending access is enough) — copy the `re_...` key.
3. In Cloudflare: **Workers & Pages** → the `jenzportfolio` project →
   **Settings** → **Variables and Secrets** → **Add**:
   - Name: `RESEND_API_KEY`, value: the `re_...` key, type **Secret**, environment **Production**.
   - (Optional) `CONTACT_TO_EMAIL` to deliver somewhere other than the default Gmail.
4. Redeploy (or push any commit). Submissions now arrive in her inbox with
   the sender's address as Reply-To.

Until the key is set, the form fails gracefully and points visitors to the
direct email address. Later, verifying a custom domain in Resend allows a
branded sender like `contact@jennyalipen.com`.
