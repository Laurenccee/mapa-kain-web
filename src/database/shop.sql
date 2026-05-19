-- 1. CREATE THE ROLES ENUM
CREATE TYPE public.store_role AS ENUM ('owner', 'manager', 'cashier');

-- 2. STORES / CARINDERIAS TABLE (From your setup)
CREATE TABLE public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STORE MEMBERS JUNCTION TABLE (The core engine for roles)
CREATE TABLE public.store_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- If the carinderia closes permanently, wipe its employee links
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- If a user deletes their profile, remove them from store staff rosters
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Assigned role handling capabilities
    role public.store_role NOT NULL DEFAULT 'cashier',
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Safety constraint: A user can only have one specific role assignment per store
    CONSTRAINT unique_store_user UNIQUE (store_id, user_id)
);

-- 5. PERFORMANCE INDEX FOR ACCESS CONTROL LOOKUPS
CREATE INDEX idx_store_members_lookup ON public.store_members(user_id, store_id);