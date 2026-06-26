CREATE TABLE IF NOT EXISTS public.viewing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mpesa',
  provider_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}'::TEXT[],
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties
  ALTER COLUMN view_count SET DEFAULT 0;

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.viewing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "viewing_payments_select_public" ON public.viewing_payments
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "viewing_payments_insert_public" ON public.viewing_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "viewing_payments_update_public" ON public.viewing_payments
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "agents_select_public" ON public.agents
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "agents_insert_admin" ON public.agents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "agents_update_admin" ON public.agents
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "agents_delete_admin" ON public.agents
  FOR DELETE USING (auth.role() = 'authenticated');
