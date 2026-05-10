-- Create life_plan_family_members table
-- This table stores family member information within each life plan
-- allowing for different income values across different life plans

CREATE TABLE public.life_plan_family_members (
  id TEXT PRIMARY KEY,
  life_plan_id TEXT NOT NULL REFERENCES public.life_plans(id) ON DELETE CASCADE,
  family_member_id TEXT REFERENCES public.family_members(id),
  name TEXT NOT NULL,
  relationship TEXT,
  income INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries by life_plan_id
CREATE INDEX idx_life_plan_family_members_life_plan_id
  ON public.life_plan_family_members(life_plan_id);

-- Enable RLS
ALTER TABLE public.life_plan_family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Application layer enforces account ownership
CREATE POLICY "Allow reading life plan family members" ON public.life_plan_family_members
  FOR SELECT USING (true);

CREATE POLICY "Allow inserting life plan family members" ON public.life_plan_family_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating life plan family members" ON public.life_plan_family_members
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow deleting life plan family members" ON public.life_plan_family_members
  FOR DELETE USING (true);
