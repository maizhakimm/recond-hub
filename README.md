# RecondHub website

Website for **RecondHub** ("King of Recond" on TikTok): recond stock with instant search, car pages that end in WhatsApp, a loan calculator, state and showroom pages, a dark "Private Sourcing" section for exotics, and the Recond Guide.

**Google Sheets is the only admin.** Stock, showrooms, agents and settings are read from one spreadsheet, and every form writes a row to its `Leads` tab. There is no CMS, no login and no database.

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, deployed on Vercel
- Sheets API via a service account, cached for 5 minutes (ISR), with on-demand refresh
- Fuse.js instant search, filters stored in the URL
- GA4 + Meta Pixel + TikTok Pixel
- Guide articles in MDX (`content/guide/`)

Staff instructions in Bahasa Malaysia are in [`STAFF-GUIDE.md`](STAFF-GUIDE.md).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; without Sheets env vars the site uses /data/sample
npm run dev                  # http://localhost:3000
```

With no `SHEET_ID` / `GOOGLE_SERVICE_ACCOUNT_JSON`, the site reads `data/sample/*.csv` and leads are printed to the server console instead of written to a sheet. That is enough to develop and demo everything.

Checks:

```bash
npm run lint
npm run typecheck   # next typegen && tsc --noEmit
npm run build
npm run check       # all three
```

## Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | prod | Service account key JSON, on one line or base64-encoded |
| `SHEET_ID` | prod | The id in the sheet URL `…/spreadsheets/d/<SHEET_ID>/edit` |
| `REVALIDATE_SECRET` | prod | Shared secret for `/api/revalidate` (the sheet's "Refresh website" button) |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical URL, e.g. `https://www.recondhub.my` (used for sitemap, canonical, JSON-LD) |
| `NEXT_PUBLIC_BRAND_NAME` | | Brand name shown everywhere. Default `RecondHub`; change it when the final name is picked |
| `NEXT_PUBLIC_LEGAL_NAME` | | Company name in footer, privacy policy and terms |
| `NEXT_PUBLIC_CONTACT_EMAIL` | | Shown on /contact and in the privacy policy |
| `NEXT_PUBLIC_TIKTOK_URL` | | TikTok profile link |
| `NEXT_PUBLIC_GA4_ID` | | `G-XXXXXXX` |
| `NEXT_PUBLIC_META_PIXEL_ID` | | Meta (Facebook) Pixel id |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | | TikTok Pixel id |
| `FALLBACK_HQ_WHATSAPP`, `FALLBACK_OWNER_WHATSAPP` | | Used only if the `Settings` tab is missing or invalid |

## Google Sheet setup

1. Create a spreadsheet with five tabs named exactly **`Stock`**, **`Showrooms`**, **`Agents`**, **`Leads`**, **`Settings`**.
2. Easiest: upload [`data/RecondHub-Database.xlsx`](data/RecondHub-Database.xlsx) to Google Drive and open it with Google Sheets. It has every tab, the exact headers, dropdowns, column notes and a Bahasa Malaysia guide tab. (Or import the CSVs from [`data/sample/`](data/sample) into each tab.) Row 1 is the header; column order doesn't matter, names do.
3. In Google Cloud: create a project, enable the **Google Sheets API**, create a **service account**, and download a JSON key.
4. Share the spreadsheet with the service account's email (`…@….iam.gserviceaccount.com`) as **Editor** (it needs to append leads).
5. Put the key JSON in `GOOGLE_SERVICE_ACCOUNT_JSON` and the sheet id in `SHEET_ID`.
6. Install the Apps Script from [`scripts/apps-script/`](scripts/apps-script) for the Refresh button, automatic sold dates and lead escalation.

### Tabs and columns

**`Stock`**: `code` · `status` (Available / Reserved / Sold / Hidden) · `make` · `model` · `variant` · `year_manufactured` · `year_registered` · `body_type` (MPV, SUV, Sedan, Hatchback, Coupe, Pickup) · `price_rm` · `mileage_km` · `grade` · `engine_cc` · `transmission` · `fuel` · `colour` · `showroom_id` · `state` · `photos` (comma-separated URLs, first = cover) · `auction_sheet_url` · `highlights` (comma-separated) · `description` · `featured` (TRUE/FALSE) · `date_added` · **`sold_date`**

> `sold_date` is an addition to the brief. "Sold stays visible for 7 days" needs to know when the car was sold. The Apps Script fills it automatically when status is set to Sold.

**`Showrooms`**: `showroom_id` · `name` · `state` · `city` · `address` · `google_maps_url` · `whatsapp` · `opening_hours` · `photo`

`opening_hours` is free text the booking modal can parse, e.g. `Mon-Sat 10:00-19:00; Sun 11:00-17:00`, `Daily 10:00-19:00`, `Mon-Fri 9:30-18:00, Sat 10-16, Sun Closed`. Hourly viewing slots are generated from it.

**`Agents`**: `agent_id` · `name` · `state` (a Malaysian state, or `HQ` for HQ sales advisors) · `showroom_id` · `whatsapp` · `photo` · `active`

**`Leads`** (written by the site): `timestamp` · `type` · `car_code` · `name` · `phone` · `state` · `showroom_id` · `preferred_date` · `preferred_time` · `details_json` · `assigned_to` · `source_page` · `utm_source` · `utm_campaign` · `status`. The escalation script adds `escalated_at`.

**`Settings`** (header row + one value row): `hq_whatsapp` · `owner_whatsapp` · `default_interest_rate` · `max_tenure_years` · `min_downpayment_pct` · `dsr_eligible_max` (60) · `dsr_borderline_max` (70). The two DSR columns are optional.

### Validation

Every row is validated on load (`src/lib/data/schema.ts`). A bad row (missing price, unknown body type, bad WhatsApp number, unknown state, duplicate code…) is **skipped with a logged warning**, never a crash. Warnings show in the Vercel function / build logs, prefixed with the tab and row number, e.g. `[Stock] row 14 skipped: price_rm Invalid input`.

Values are forgiving: `RM 238,000` and `238000` both work; dates can be `2026-09-28` or `28/09/2026`; phone numbers `012-345 6789` become `60123456789`; states accept `Pulau Pinang`, `KL`, `N9` etc.

### Photos

Photo folders are automatic: typing a car `code` makes the Apps Script create a Drive folder (inside `PHOTOS_FOLDER_ID`, shared anyone-with-link view) and write its link to `photo_folder`. Staff drop photos named 01, 02, … into it; every 10 minutes (and on "Refresh website") the script writes the sorted image links to `photos` and any file named "auction…" to `auction_sheet_url`. See `scripts/apps-script/Photos.gs`.

You can still paste Google Drive share links or any HTTPS image URL into `photos` by hand for a car with no folder. Drive links (`drive.google.com/file/d/<id>/view`) are rewritten to `lh3.googleusercontent.com/d/<id>`, and **every photo is served through `next/image`** (resized, AVIF/WebP, cached by Vercel), so visitors never download from Drive directly. Drive files must be shared as "Anyone with the link can view".

`next.config.ts` currently allows any HTTPS host so staff can paste links from anywhere; narrow `images.remotePatterns` once you know where photos live.

## How data refreshes

- Sheet data is cached for **5 minutes** (`unstable_cache` tagged `sheets`, and `revalidate = 300` on pages).
- **Refresh now**: `GET` or `POST /api/revalidate?secret=REVALIDATE_SECRET` expires the tag and all pages. The Apps Script menu button calls this.
- If the Sheets API fails, the error propagates on purpose, so Vercel keeps serving the last good pages instead of an empty site.

## Leads and routing

Every CTA and form posts to `POST /api/leads`, which validates, routes, appends a row to `Leads`, and returns the WhatsApp number to open. The browser then opens `wa.me/<number>` with a pre-filled message. If logging fails or times out (4 s), WhatsApp still opens, so no enquiry is lost at the last step.

Routing (`src/lib/leads/routing.ts`):

1. `private_sourcing` → `owner_whatsapp`, always
2. "Chat" buttons on a named agent's or showroom's card → that agent / showroom
3. `viewing_booking` → the selected showroom's WhatsApp (`assigned_to` = ref agent if any, else the showroom)
4. `agent_application` → HQ
5. Visitor has a `?ref=<agent_id>` cookie (30 days) → that agent
6. `find_me_a_car` → HQ
7. Other leads → an active agent in the buyer's state (form), else the car's state, rotating round-robin by minute
8. No agent there → HQ sales advisors (`Agents` rows with state `HQ`) round-robin, else `hq_whatsapp`

`assigned_to` and the rule used are stored on the row. A hidden honeypot field drops bot submissions.

**Agent links**: every agent has a profile at `/agent/<id>` showing their personal link (`/agent/a01?ref=A01`). `?ref=` works on any URL. `src/proxy.ts` stores it in an HttpOnly cookie for 30 days, and first-touch `utm_source` / `utm_campaign` for the session.

## Pages

| URL | What |
| --- | --- |
| `/` | Hero search, featured, browse by make / body / monthly budget, trust strip, guides, deliveries, TikTok, Private teaser |
| `/cars` | All stock, instant search, filters and sort synced to the URL |
| `/cars/toyota`, `/cars/toyota/alphard`, `/cars/body/mpv`, `/cars/under-200k` | SEO landing pages |
| `/cars/rh102-toyota-alphard-2022` | Car page: gallery + lightbox, specs, auction sheet viewer, 4 CTAs, loan calculator, showroom, local agent, related cars and guides |
| `/loan-calculator` | Standalone calculator + DSR eligibility |
| `/showrooms`, `/johor` … `/labuan` | Showrooms and agents by state (all 16 states and federal territories) |
| `/agent/<id>` | Agent profile and referral link |
| `/private` | Private Sourcing (dark design, never shows prices, routes to the owner) |
| `/guide`, `/guide/category/<cat>`, `/guide/<slug>` | Recond Guide |
| `/find-me-a-car`, `/become-an-agent`, `/why-us`, `/about`, `/contact`, `/privacy`, `/terms` | |

**Sold cars**: listed with a Sold badge for 7 days after `sold_date`. The car page shows "Sold" plus alternatives (noindex) for 30 days, then permanently redirects to the model page. Next.js `permanentRedirect` sends **308**, which search engines treat the same as a 301. `Hidden` cars always 404.

## Content you edit in the repo

- **Guide articles**: `content/guide/*.mdx`. Frontmatter: `title`, `description`, `category` (`buying-basics` · `model-price-guides` · `costs-loans` · `import-exotics`), `date`, optional `updated`, and tags that pull matching stock into the article: `makes`, `models`, `body_types` (lower-case slugs), `price_min` / `price_max`. `faqs` (list of `q` / `a`) render an FAQ block with FAQPage schema. `cta: private` swaps the closing WhatsApp CTA for Private Sourcing. `<Callout title="…">` is available inside articles. The table of contents is built from `##` / `###` headings.
- **Media**: `src/content/media.ts` holds customer deliveries, TikTok video ids, Private Sourcing deliveries, the optional hero video, reviews and financing partners. Reviews and financing partners are empty on purpose: add only real ones, and their sections appear.
- The images in `public/sample/` are placeholders for the demo data.

## SEO

- Per-page titles and descriptions with Bahasa Malaysia search terms (kereta recond, harga)
- JSON-LD: `Car` + `Offer` on car pages, `AutoDealer` for every showroom, `Article` and `FAQPage` on guides, `BreadcrumbList` everywhere, `WebSite` + `SearchAction` on home
- `sitemap.xml` (all live stock, makes, models, body types, budgets, states, agents, articles) and `robots.txt`. Preview deployments are `Disallow: /`.
- Canonical URLs; a car URL with an outdated make/model/year redirects to the current one.

## Analytics

`src/lib/analytics.ts` sends each event to GA4 (`gtag`), Meta (`trackCustom`, plus a standard event such as `Lead`, `Contact` or `Schedule`) and TikTok, with `car_code`, `state` and `agent` parameters:

`search` · `filter_apply` · `view_car` · `click_whatsapp` · `open_booking` · `submit_booking` · `use_calculator` · `submit_loan_check` · `submit_trade_in` · `submit_find_me_a_car` · `submit_private_sourcing` · `submit_agent_application`

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (framework: Next.js, no settings to change).
2. Add the environment variables above for **Production** (and Preview if you want previews to use the real sheet).
3. Deploy, then set `NEXT_PUBLIC_SITE_URL` to your domain and redeploy.
4. Put the same `REVALIDATE_SECRET` and `SITE_URL` in the Apps Script properties.
5. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Project layout

```
content/guide/            MDX articles
data/sample/              Sample CSV for every tab (20 cars, 3 showrooms, 5 agents)
scripts/apps-script/      Refresh website, auto sold dates, lead escalation
src/proxy.ts              ?ref and UTM cookies
src/app/(main)/           Public site (header/footer layout)
src/app/private/          Private Sourcing (own dark layout)
src/app/api/leads         Lead logging + routing
src/app/api/revalidate    On-demand refresh
src/lib/data/             Sheets client, validation, queries
src/lib/leads/            Lead types, routing, browser helper
src/lib/loan.ts           Flat-rate hire purchase + DSR
src/components/           UI
```

## Assumptions made

- Working brand name `RecondHub`, configurable by env var.
- Added an optional `sold_date` column to `Stock` (filled by Apps Script) and optional DSR thresholds in `Settings`.
- Round-robin rotates by the current minute (stateless) rather than a counter in the sheet, to avoid a read-modify-write race on every lead.
- `find_me_a_car` and `agent_application` go to HQ as the brief says; a visitor's `?ref` agent still gets their `find_me_a_car` leads.
- Booking dates start today (if slots remain) and run 14 days; closed days are skipped.
- Deliveries, TikTok videos and Private Sourcing deliveries live in `src/content/media.ts`, not the sheet, since they change rarely.
- Escalation emails HQ; WhatsApp escalation needs a gateway URL (Apps Script can't send WhatsApp itself).
- Privacy policy and terms are sensible starting templates. Have them reviewed by your lawyer.
