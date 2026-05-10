CREATE TABLE hobby_activities (
  id TEXT PRIMARY KEY,
  life_plan_id TEXT NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  family_member_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_fee INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hobby_activities_life_plan_id ON hobby_activities(life_plan_id);
CREATE INDEX idx_hobby_activities_family_member_id ON hobby_activities(family_member_id);

CREATE TABLE hobby_activity_annual_costs (
  id TEXT PRIMARY KEY,
  hobby_activity_id TEXT NOT NULL REFERENCES hobby_activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  times_per_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hobby_activity_annual_costs_hobby_activity_id ON hobby_activity_annual_costs(hobby_activity_id);
