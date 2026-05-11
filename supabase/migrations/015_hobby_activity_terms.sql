-- Separate monthly_fee and period information from hobby_activities to hobby_activity_terms
-- hobby_activities: 親エンティティ（習い事の名前）
-- hobby_activity_terms: 子エンティティ（期間ごとの月謝）

CREATE TABLE hobby_activity_terms (
  id TEXT PRIMARY KEY,
  hobby_activity_id TEXT NOT NULL REFERENCES hobby_activities(id) ON DELETE CASCADE,
  monthly_fee INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hobby_activity_terms_hobby_activity_id ON hobby_activity_terms(hobby_activity_id);

-- Migrate existing data
INSERT INTO hobby_activity_terms (id, hobby_activity_id, monthly_fee, start_year, end_year)
SELECT id, id, monthly_fee, start_year, end_year FROM hobby_activities;

-- Drop columns from hobby_activities
ALTER TABLE hobby_activities DROP COLUMN monthly_fee;
ALTER TABLE hobby_activities DROP COLUMN start_year;
ALTER TABLE hobby_activities DROP COLUMN end_year;
