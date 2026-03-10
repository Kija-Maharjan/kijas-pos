# Nepal Food Factory POS v2.0

A clean, separated-file build of the Nepal Food Factory Point of Sale system.

## Project Structure

```
trios-cafe-pos/
├── public/
│   ├── index.html          ← Main app shell (HTML only)
│   ├── css/
│   │   └── style.css       ← All styles
│   └── js/
│       ├── menu.js         ← Menu data (categories & items)
│       ├── cart.js         ← Cart state & rendering
│       ├── orders.js       ← Place order, history, bulk delete
│       ├── tables.js       ← Floor map & table management
│       ├── sales.js        ← Sales dashboard & print report
│       └── app.js          ← Init, clock, mobile nav
├── api/
│   ├── orders.js           ← GET / POST / DELETE orders
│   ├── daily.js            ← GET / POST daily summaries
│   └── health.js           ← Health check
├── supabase_setup.sql      ← Run once in Supabase SQL Editor
├── vercel.json             ← Vercel routing
├── package.json
└── .env.local              ← Create this (see below)
```

## 1 · Supabase Setup

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste the contents of `supabase_setup.sql` and click **Run**
3. This creates three tables:
   - **`orders`** — every placed order
   - **`daily_summaries`** — auto-saved nightly totals
   - **`db_config`** — runtime settings (restaurant name, VAT %, PIN, etc.)

## 2 · Environment Variables

Create `.env.local` in the project root:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase → **Settings → API**.

## 3 · Local Development

```bash
npm install
npm run dev       # starts Vercel dev server at http://localhost:3000
```

## 4 · Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard or:
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

## 5 · Customise

| What to change | Where |
|---|---|
| Restaurant name / sub-title | `supabase_setup.sql` → `db_config` rows, or edit directly in Supabase Table Editor |
| Menu items & prices | `public/js/menu.js` |
| VAT / service charge | `db_config` table: `vat_percent`, `service_percent` |
| Admin PIN | `db_config` table: `pin_admin` |
| Colors & fonts | `public/css/style.css` → `:root` variables |
| Table layout | `public/js/tables.js` → `TABLES_DEF` array |

## db_config Keys Reference

| Key | Default | Description |
|---|---|---|
| `restaurant_name` | Nepal Food Factory | Header name |
| `restaurant_sub` | Point of Sale · Kathmandu | Header sub-title |
| `currency_symbol` | Rs. | Price prefix |
| `vat_percent` | 0 | VAT % (0 = off) |
| `service_percent` | 0 | Service charge % (0 = off) |
| `pin_admin` | 1234 | POS lock PIN |
