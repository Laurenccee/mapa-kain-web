-- Create a table for menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure a store can't have two items with the exact same name
  CONSTRAINT unique_store_item_name UNIQUE (store_id, name)
);

-- Index for fast lookup when opening the store sheet
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);

-- Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Keep policy creation idempotent for repeated runs.
DROP POLICY IF EXISTS "Allow public read access for menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow store admins to insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow store admins to update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow store admins to delete menu items" ON public.menu_items;

-- Anyone can view menu items.
CREATE POLICY "Allow public read access for menu items"
ON public.menu_items FOR SELECT
USING (true);

-- Only store owners/managers can create menu items.
CREATE POLICY "Allow store admins to insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.store_members
    WHERE store_members.store_id = menu_items.store_id
      AND store_members.user_id = auth.uid()
      AND store_members.role IN ('owner', 'manager')
  )
);

-- Only store owners/managers can update menu items.
CREATE POLICY "Allow store admins to update menu items"
ON public.menu_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.store_members
    WHERE store_members.store_id = menu_items.store_id
      AND store_members.user_id = auth.uid()
      AND store_members.role IN ('owner', 'manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.store_members
    WHERE store_members.store_id = menu_items.store_id
      AND store_members.user_id = auth.uid()
      AND store_members.role IN ('owner', 'manager')
  )
);

-- Only store owners/managers can delete menu items.
CREATE POLICY "Allow store admins to delete menu items"
ON public.menu_items FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.store_members
    WHERE store_members.store_id = menu_items.store_id
      AND store_members.user_id = auth.uid()
      AND store_members.role IN ('owner', 'manager')
  )
);

-- Storage policies for menu bucket uploads.
DROP POLICY IF EXISTS "Menu bucket admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Menu bucket admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Menu bucket admins can delete files" ON storage.objects;

-- Only owner/manager members of a store can upload into menu bucket paths like {store_id}/file.
CREATE POLICY "Menu bucket admins can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu'
  AND EXISTS (
    SELECT 1
    FROM public.store_members sm
    WHERE sm.store_id::text = (storage.foldername(name))[1]
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'manager')
  )
);

-- Only owner/manager members of a store can update files in that store folder.
CREATE POLICY "Menu bucket admins can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu'
  AND EXISTS (
    SELECT 1
    FROM public.store_members sm
    WHERE sm.store_id::text = (storage.foldername(name))[1]
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'manager')
  )
)
WITH CHECK (
  bucket_id = 'menu'
  AND EXISTS (
    SELECT 1
    FROM public.store_members sm
    WHERE sm.store_id::text = (storage.foldername(name))[1]
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'manager')
  )
);

-- Only owner/manager members of a store can delete files in that store folder.
CREATE POLICY "Menu bucket admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu'
  AND EXISTS (
    SELECT 1
    FROM public.store_members sm
    WHERE sm.store_id::text = (storage.foldername(name))[1]
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'manager')
  )
);