CREATE TABLE IF NOT EXISTS checkout_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id uuid REFERENCES apps(id) ON DELETE SET NULL,
  app_name text,
  app_slug text,
  buyer_email text,
  buyer_name text,
  amount numeric(10,2),
  stripe_session_id text,
  affiliation_code text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE checkout_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_checkout" ON checkout_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "insert_checkout_attempt" ON checkout_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_select_checkout" ON checkout_attempts FOR SELECT USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
CREATE POLICY "admin_select_sales" ON sales FOR SELECT USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
CREATE POLICY "admin_select_apps" ON apps FOR SELECT USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
CREATE POLICY "admin_select_affiliations" ON affiliations FOR SELECT USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
