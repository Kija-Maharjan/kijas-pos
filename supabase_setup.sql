-- ══════════════════════════════════════════════════
--  Nepal Food Factory POS  —  Supabase SQL Setup
--  Run this in: Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════


-- ── 1. ORDERS TABLE ───────────────────────────────
--  Stores every placed order with items as JSON
CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT        NOT NULL,
  table_no      TEXT,
  items         JSONB       NOT NULL,    -- array of { id, name, price, qty, emoji, category }
  total         INTEGER     NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);


-- ── 2. DAILY SUMMARIES TABLE ──────────────────────
--  Auto-saved at midnight; one row per day
CREATE TABLE IF NOT EXISTS daily_summaries (
  id               BIGSERIAL PRIMARY KEY,
  date             DATE        NOT NULL UNIQUE,   -- e.g. '2025-07-15'
  total_revenue    INTEGER     NOT NULL DEFAULT 0,
  total_orders     INTEGER     NOT NULL DEFAULT 0,
  top_items        JSONB,                          -- [ [name, {qty, rev}], ... ]
  category_totals  JSONB,                          -- { "Breakfast": {rev, qty}, ... }
  table_totals     JSONB,                          -- { "1": {rev, orders}, ... }
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_summaries (date DESC);


-- ── 3. DB CONFIG TABLE (NEW) ──────────────────────
--  Key-value store for runtime settings editable
--  from the POS without redeployment.
--  Examples: restaurant name, VAT %, service charge %
CREATE TABLE IF NOT EXISTS db_config (
  key         TEXT PRIMARY KEY,   -- e.g. 'restaurant_name', 'vat_percent'
  value       TEXT NOT NULL,      -- stored as text; parse in app as needed
  description TEXT,               -- human-readable label shown in admin UI
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default config values
INSERT INTO db_config (key, value, description) VALUES
  ('restaurant_name',   'Nepal Food Factory',      'Name shown in header & reports'),
  ('restaurant_sub',    'Nepal Food Factory · POS','Sub-title shown under the name'),
  ('currency_symbol',   'Rs.',                      'Currency prefix for all prices'),
  ('vat_percent',       '0',                        'VAT % applied to orders (0 = disabled)'),
  ('service_percent',   '0',                        'Service charge % (0 = disabled)'),
  ('pin_admin',         '1234',                     'Admin PIN for locking the POS')
ON CONFLICT (key) DO NOTHING;

-- Trigger to auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_db_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_db_config_updated
  BEFORE UPDATE ON db_config
  FOR EACH ROW EXECUTE FUNCTION update_db_config_timestamp();


-- ── ENABLE ROW LEVEL SECURITY (recommended) ───────
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_config       ENABLE ROW LEVEL SECURITY;

-- Allow anon key full access (POS runs with anon key)
CREATE POLICY "anon full access" ON orders
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon full access" ON daily_summaries
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon read config" ON db_config
  FOR SELECT TO anon USING (true);

-- Only authenticated users can update config
CREATE POLICY "auth write config" ON db_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ── VERIFICATION ──────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('orders','daily_summaries','db_config')
ORDER BY table_name;
