CREATE POLICY "admin_select_withdrawals" ON withdrawals FOR SELECT
USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');

CREATE POLICY "admin_update_withdrawals" ON withdrawals FOR UPDATE
USING ((auth.jwt() ->> 'email') = 'sinkronizeapps@gmail.com');
