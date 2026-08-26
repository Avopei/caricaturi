-- Collapse the plan structure to exactly two public tiers: free and pro.
-- "admin" is a role (profiles.role), not a plan, and was already migrated
-- out of the plan column in 0001. This migration only needs to handle any
-- "studio" rows created while that tier briefly existed.
-- Idempotent: safe to run multiple times.

update public.profiles set plan = 'pro' where plan = 'studio';

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'pro'));

-- app_settings.studio_plan_limit (if it exists from 0001) is no longer read
-- by the app; left in place rather than dropped, since dropping a column is
-- unnecessary churn for a value nothing references anymore.
