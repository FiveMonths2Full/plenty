CREATE TABLE IF NOT EXISTS banks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Nearby'
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER NOT NULL REFERENCES banks(id),
  name TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  qty INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE banks ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Seed banks
INSERT INTO banks (id, name, location) VALUES
  (1, 'Blacksburg Community Pantry', '0.4 mi'),
  (2, 'Christiansburg Food Bank', '3.1 mi'),
  (3, 'NRV Community Kitchen', '5.8 mi')
ON CONFLICT (id) DO NOTHING;

-- Seed items
INSERT INTO items (id, bank_id, name, detail, priority, qty) VALUES
  (1,  1, 'Peanut butter',   'Any size',                'high',   10),
  (2,  1, 'Canned beans',    'Black, kidney, or pinto', 'high',   20),
  (3,  1, 'Canned tuna',     'In water preferred',      'high',   15),
  (4,  1, 'Pasta',           'Spaghetti or penne',      'medium', 12),
  (5,  1, 'Rice (2 lb)',     'White or brown',           'medium',  8),
  (6,  1, 'Oatmeal',         'Instant or old-fashioned', 'low',    6),
  (7,  2, 'Canned soup',     'Any variety',             'high',   18),
  (8,  2, 'Mac & cheese',    'Any brand',               'high',   14),
  (9,  2, 'Cooking oil',     'Vegetable or canola',     'medium',  5),
  (10, 2, 'Cereal',          'Low sugar preferred',     'medium',  9),
  (11, 2, 'Canned fruit',    'In juice, not syrup',     'low',     7),
  (12, 3, 'Dried lentils',   'Any color',               'high',   11),
  (13, 3, 'Canned tomatoes', 'Diced or whole',          'medium',  8),
  (14, 3, 'Flour',           'All-purpose',             'low',     4)
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to avoid conflicts with future inserts
SELECT setval('banks_id_seq', (SELECT MAX(id) FROM banks));
SELECT setval('items_id_seq', (SELECT MAX(id) FROM items));
