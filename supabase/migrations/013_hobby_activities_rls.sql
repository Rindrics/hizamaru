ALTER TABLE hobby_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hobby_activity_annual_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hobby_activities_select" ON hobby_activities FOR SELECT USING (TRUE);
CREATE POLICY "hobby_activities_insert" ON hobby_activities FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "hobby_activities_update" ON hobby_activities FOR UPDATE USING (TRUE);
CREATE POLICY "hobby_activities_delete" ON hobby_activities FOR DELETE USING (TRUE);

CREATE POLICY "hobby_activity_annual_costs_select" ON hobby_activity_annual_costs FOR SELECT USING (TRUE);
CREATE POLICY "hobby_activity_annual_costs_insert" ON hobby_activity_annual_costs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "hobby_activity_annual_costs_update" ON hobby_activity_annual_costs FOR UPDATE USING (TRUE);
CREATE POLICY "hobby_activity_annual_costs_delete" ON hobby_activity_annual_costs FOR DELETE USING (TRUE);
