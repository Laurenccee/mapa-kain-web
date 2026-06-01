-- 1. CREATE THE ROLES ENUM
CREATE TYPE public.store_role AS ENUM ('owner', 'manager', 'cashier');

-- 2. STORES / CARINDERIAS TABLE
-- Mirrors RegisterStoreSchema fields: name, openTime, closeTime, description, buildingId
CREATE TABLE public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    building_id TEXT NOT NULL UNIQUE,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT stores_name_min_length CHECK (char_length(trim(name)) >= 3),
    CONSTRAINT stores_description_max_length CHECK (
        description IS NULL OR char_length(description) <= 1000
    ),
    CONSTRAINT stores_building_id_format CHECK (
        building_id ~ '^bld_-?[0-9]+\.[0-9]{7}_-?[0-9]+\.[0-9]{7}$'
    ),
    CONSTRAINT stores_building_id_not_unknown CHECK (
        building_id NOT LIKE 'bld_unk_%'
    )
);

-- 3. STORE MEMBERS JUNCTION TABLE (The core engine for roles)
CREATE TABLE public.store_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- If the carinderia closes permanently, wipe its employee links
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- If a user deletes their profile, remove them from store staff rosters
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Assigned role handling capabilities
    role public.store_role NOT NULL DEFAULT 'cashier',
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Safety constraint: A user can only have one specific role assignment per store
    CONSTRAINT unique_store_user UNIQUE (store_id, user_id)
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX idx_store_members_lookup ON public.store_members(user_id, store_id);
CREATE INDEX idx_stores_is_active ON public.stores(is_active);

-- 5. OWNER MEMBERSHIP GUARANTEES
-- Exactly one owner role per store.
CREATE UNIQUE INDEX idx_store_members_one_owner_per_store
    ON public.store_members(store_id)
    WHERE role = 'owner';

-- Automatically enroll the store creator as the first owner member.
CREATE OR REPLACE FUNCTION public.sync_store_owner_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.store_members (store_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (store_id, user_id)
    DO UPDATE SET
        role = 'owner',
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_store_owner_member
AFTER INSERT ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.sync_store_owner_member();

-- Helper for RLS checks without recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_store_admin(target_store_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.store_members sm
        WHERE sm.store_id = target_store_id
          AND sm.user_id = auth.uid()
          AND sm.role IN ('owner', 'manager')
    );
$$;

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

-- STORES POLICIES
-- Anyone can view active stores
CREATE POLICY "Stores are viewable by everyone" 
ON public.stores FOR SELECT 
USING (is_active = true);

-- Only the owner can update their store
CREATE POLICY "Owners can update their own stores" 
ON public.stores FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Only authenticated users can create a store
CREATE POLICY "Authenticated users can create stores" 
ON public.stores FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- STORE MEMBERS POLICIES
-- Anyone can view members of a store (to see who works there)
CREATE POLICY "Store members are viewable by everyone" 
ON public.store_members FOR SELECT 
USING (true);

-- Ensure previous policy variants are replaced safely.
DROP POLICY IF EXISTS "Owners can manage store members" ON public.store_members;
DROP POLICY IF EXISTS "Owners and managers can manage store members" ON public.store_members;

-- Owners and managers can manage store members (add/remove/change roles)
CREATE POLICY "Owners and managers can manage store members" 
ON public.store_members FOR ALL 
USING (
    public.is_store_admin(store_id)
)
WITH CHECK (
    public.is_store_admin(store_id)
    OR (
        role = 'owner'
        AND user_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.stores s
            WHERE s.id = store_id
              AND s.owner_id = auth.uid()
        )
    )
);