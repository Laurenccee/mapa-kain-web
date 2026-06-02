CREATE TABLE public.stamps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- If user deletes account, wipe their stamps automatically
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- If store deletes account, keep the stamp record for user history but set store to NULL
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    -- Extracted snapshot data (In case the store name changes or is deleted later)
    store_name_snapshot TEXT NOT NULL, 
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. REWARDS LEDGER (For when 10 stamps are converted into a free ulam)
CREATE TABLE public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'unredeemed' CHECK (status IN ('unredeemed', 'redeemed', 'expired')),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_stamps_user_store ON public.stamps(user_id, store_id);
CREATE INDEX idx_stamps_cooldown ON public.stamps(user_id, store_id, scanned_at);