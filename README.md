# April Coffee
An April Coffee headless storefront. It combines a Shopify-powered web shop with editorial content from DatoCMS and Shopify blogs.
Built with the Next.js App Router, React Server Components, Server Actions, `Suspense`, and component-level caching.

## How it works

**Commerce (Shopify)** — Products, collections, cart, and checkout are powered by the Shopify Storefront API. Customers browse and buy through standard shop routes; checkout redirects to Shopify.

**Editorial content** — The advice feed and article pages prefer DatoCMS when `DATOCMS_API_TOKEN` is set. If DatoCMS is unavailable or not configured, the app falls back to Shopify blog posts (advice and lookbook handles) or a product grid from a collection.

**CMS pages (DatoCMS)** — When configured, DatoCMS also supplies the landing page hero and featured content, seasonal product ranges, retail shop listings, and coffee info / farm recipe pages. Without DatoCMS, those sections use app defaults or Shopify data.

**Cache revalidation** — Webhook endpoints invalidate cached Shopify and DatoCMS content on publish, so updates appear without a full redeploy.

## Features
- **Landing page** — Tri-Ferg navigation linking to shops, web shop, advice, and external destinations
- **Dynamic header nav** — The third nav slot shows the latest advice article title and links to that article; if no article is available, it falls back to **Latest** linking to `/projects`
- **Seasonal range nav** — When a DatoCMS range is published, its title is prepended to the header (e.g. `SUMMER 2026 RANGE`)
- **Web shop** — Collections, product detail, cart, and Shopify checkout
- **Advice** — Editorial feed from DatoCMS (when configured) or Shopify blog posts / product grids
- **Lookbook** — Shopify blog asrticles for seasonal lookbooks
- **Range** — Seasonal product ranges and lookbook-style product pages from DatoCMS
- **Shops** — Retail location listings and galleries from DatoCMS
- **On-demand revalidation** — Webhook endpoints for Shopify and DatoCMS cache invalidation
## Tech stack
| Layer     | Technology              |
| --------- | ----------------------- |
| Framework | Next.js 16              |
| UI        | React, Tailwind CSS     |
| Commerce  | Shopify Storefront API  |
| Content   | DatoCMS (optional)      |
| Language  | TypeScript              |

## Routes

| Path                             | Description                     |
| -------------------------------- | ------------------------------- |
| `/`                              | Landing page with Tri-Ferg nav  |
| `/collections/all`               | All products                    |
| `/collections/[collection]`      | Collection page with filters    |
| `/product/[handle]`              | Standard product page           |
| `/range/[slug]`                  | DatoCMS seasonal range          |
| `/range/[slug]/product/[handle]` | Range product detail            |
| `/projects`                      | Projects feed                   |
| `/projects/[slug]`               | Project article                 |
| `/lookbook/[slug]`               | Lookbook article (Shopify blog) |
| `/shops`                         | Shop directory                  |
| `/shops/[slug]`                  | Shop detail                     |
| `/coffee-inf-recipes`            | Coffee info farm index          |
| `/coffee-inf-recipes/[slug]`     | Farm info & recipes (DatoCMS)   |
| `/cart`                          | Shopping cart                   |
| `/checkout`                      | Checkout redirect               |

## API routes

| Endpoint                        | Purpose                          |
| ------------------------------- | -------------------------------- |
| `GET /api/projects`             | Paginated projects feed          |
| `GET /api/projects/[slug]`      | Single project article           |
| `GET /api/collections/products` | Collection products (pagination) |
| `POST /api/revalidate`          | Shopify on-demand revalidation   |
| `POST /api/revalidate-dato`     | DatoCMS on-demand revalidation   |

## Project structure

```
app/
  (landing)/     # Palace-style pages (landing, shop, advice, range, shops)
  (store)/       # Alternate product routes
  api/           # Advice feed and revalidation endpoints
components/
  store/         # Shop UI (header, footer, product cards, cart)
  advice/        # Editorial feed and article detail
lib/
  shopify/       # Shopify Storefront API client, queries, mutations
  cms/           # DatoCMS client (landing, ranges, shops, advice)
  store/         # Product/collection helpers and mappers
  get-landing-page.ts  # Header, footer, and Tri-Ferg nav assembly
```

## Navigation

Header and Tri-Ferg nav are built in `lib/get-landing-page.ts`.

**Default slots:** Shops · Web Shop · Latest · Advice · Manor Place

**When content is available:**

1. **Latest advice article** — The **Latest** slot is replaced with the article title and links to `/projects/[slug]`. The article is taken from the first item in the advice feed, or from the DatoCMS homepage featured content if the feed is empty.
2. **Seasonal range** — The latest DatoCMS range title is prepended to the header (e.g. `SUMMER 2026 RANGE` → `/range/summer-2026`).
3. **Fallback** — If no valid article is found, the slot stays as **Latest** and links to `/projects`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. **Do not commit `.env` or `.env.local`** — they contain secrets that grant access to your Shopify store and DatoCMS project.

### Site

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `COMPANY_NAME`         | Company name used in metadata                    |
| `SITE_NAME`            | Site title                                       |
| `NEXT_PUBLIC_SITE_URL` | Public origin for post-checkout `return_to` URLs |

### Shopify

| Variable                                  | Description                                                       |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `SHOPIFY_STORE_DOMAIN`                    | Store subdomain, e.g. `your-store.myshopify.com`                  |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`         | Storefront API access token                                       |
| `SHOPIFY_REVALIDATION_SECRET`             | Secret for `POST /api/revalidate`                                 |
| `SHOPIFY_ADVICE_FEED_SOURCE`              | `auto`, `blog`, or `products` (default: `auto`)                   |
| `SHOPIFY_ADVICE_BLOG_HANDLE`              | Blog handle for advice articles (default: `advice`)               |
| `SHOPIFY_LOOKBOOK_BLOG_HANDLE`            | Blog handle for lookbook articles (default: `lookbook`)           |
| `SHOPIFY_ADVICE_COLLECTION_HANDLE`        | Fallback collection when no blogs are configured (default: `all`) |
| `SHOPIFY_HOME_FEATURED_COLLECTION_HANDLE` | Featured collection on homepage                                   |
| `SHOPIFY_HOME_CAROUSEL_COLLECTION_HANDLE` | Carousel collection on homepage                                   |

### DatoCMS (optional)

When `DATOCMS_API_TOKEN` is set, the app loads homepage content, advice articles, seasonal ranges, and shop pages from DatoCMS. Without it, those sections fall back to defaults or Shopify data.

| Variable                 | Description                            |
| ------------------------ | -------------------------------------- |
| `DATOCMS_API_TOKEN`      | Content Delivery API read token        |
| `DATOCMS_WEBHOOK_SECRET` | Secret for `POST /api/revalidate-dato` |

### Contact form (Freshdesk)

Submissions from `/get-in-contact` create tickets in [Freshdesk](https://aprilcoffeeroastery.freshdesk.com/).

| Variable            | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `FRESHDESK_API_KEY` | Freshdesk API key (Profile → View profile → Your API key) |
| `FRESHDESK_DOMAIN`  | Freshdesk domain (default: `aprilcoffeeroastery.freshdesk.com`) |

**Required DatoCMS models (API keys):** `article`, `homepage`, `shop`, `range`, `product`, `coffee_farm` (+ block `coffee_farm_coffee`)

**Homepage model fields:** `herotitle`, `herodescription`, `heroimage`, `featuredcontent` (article slug). Header and footer links use app defaults until those fields exist in DatoCMS.

**Coffee Info (`coffee_farm`) fields:**

| API key | Type | Use |
| --- | --- | --- |
| `title` | Single-line string | Farm heading, e.g. `VOLCAN AZUL` |
| `slug` | SEO slug | `/coffee-inf-recipes/[slug]` |
| `description` | Multiple-paragraph text | Intro under the farm title |
| `generalinformation` | Multiple-paragraph text | General Information accordion |
| `photos` | Asset gallery (images) | Uploaded photos |
| `image_url` | Multiple-paragraph text | Optional image URLs, one per line |
| `coffees` | Modular content → `coffee_farm_coffee` | Coffee recipe accordions |

**`coffee_farm_coffee` block fields:** `name`, `recipefilter`, `recipeespresso`, `lotinformations` (all text).

Without DatoCMS (or if the model has no published records), Coffee Info shows **No data**.

## Running locally

```bash
pnpm install
pnpm dev
s

The app runs at [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
pnpm build    # Production build
pnpm start    # Start production server
pnpm test     # Prettier check
```

## Content sources

**Advice feed** — Controlled by `SHOPIFY_ADVICE_FEED_SOURCE`:

- `auto` — DatoCMS if configured; otherwise Shopify blog if handles are set; otherwise product grid from a collection
- `blog` — Shopify blog articles (`SHOPIFY_ADVICE_BLOG_HANDLE` and `SHOPIFY_LOOKBOOK_BLOG_HANDLE`)
- `products` — Product grid from `SHOPIFY_ADVICE_COLLECTION_HANDLE`

**Ranges, shops, and coffee info farms** — Prefer DatoCMS when configured. Coffee Info shows **No data** when there are no published `coffee_farm` records.

## Deployment

Deploy to [Vercel](https://vercel.com) or any platform that supports Next.js 16. Set the environment variables above in your deployment settings and configure Shopify and DatoCMS webhooks to call the revalidation endpoints on publish.
