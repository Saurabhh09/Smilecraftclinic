REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC, anon;
-- policies are evaluated as the querying role, so signed-in staff must keep EXECUTE on the two role checks
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated;
-- rate limiting table is service-role only by design; add an explicit deny-all policy so it is not "RLS without policy"
CREATE POLICY "no client access to rate limits" ON public.rate_limit_hits FOR SELECT TO authenticated USING (false);