-- RLS policies for income_records, income_terms, hobby_activity_terms

ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hobby_activity_terms ENABLE ROW LEVEL SECURITY;

-- Income records policies
CREATE POLICY "income_records_select" ON income_records FOR SELECT USING (true);
CREATE POLICY "income_records_insert" ON income_records FOR INSERT WITH CHECK (true);
CREATE POLICY "income_records_update" ON income_records FOR UPDATE USING (true);
CREATE POLICY "income_records_delete" ON income_records FOR DELETE USING (true);

-- Income terms policies
CREATE POLICY "income_terms_select" ON income_terms FOR SELECT USING (true);
CREATE POLICY "income_terms_insert" ON income_terms FOR INSERT WITH CHECK (true);
CREATE POLICY "income_terms_update" ON income_terms FOR UPDATE USING (true);
CREATE POLICY "income_terms_delete" ON income_terms FOR DELETE USING (true);

-- Hobby activity terms policies
CREATE POLICY "hobby_activity_terms_select" ON hobby_activity_terms FOR SELECT USING (true);
CREATE POLICY "hobby_activity_terms_insert" ON hobby_activity_terms FOR INSERT WITH CHECK (true);
CREATE POLICY "hobby_activity_terms_update" ON hobby_activity_terms FOR UPDATE USING (true);
CREATE POLICY "hobby_activity_terms_delete" ON hobby_activity_terms FOR DELETE USING (true);
