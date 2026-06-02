-- Create a table for menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category TEXT, -- e.g., 'Drinks', 'Main Course', 'Desserts'
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure a store can't have two items with the exact same name
  CONSTRAINT unique_store_item_name UNIQUE (store_id, name)
);

-- Index for fast lookup when opening the store sheet
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);