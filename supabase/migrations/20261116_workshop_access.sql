ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS live_membership_until date;

CREATE OR REPLACE FUNCTION public.protect_profile_entitlements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.membership_active := false;
      NEW.membership_start := NULL;
      NEW.membership_end := NULL;
      NEW.purchased_analyses := '{}';
      NEW.is_admin := false;
      NEW.stripe_customer_id := NULL;
      NEW.subscription_plan := NULL;
      NEW.maya_ki_enabled := false;
      NEW.chat_messages_limit := NULL;
      NEW.max_events_override := NULL;
      NEW.live_membership_until := NULL;
    ELSIF NEW.membership_active IS DISTINCT FROM OLD.membership_active
      OR NEW.membership_start IS DISTINCT FROM OLD.membership_start
      OR NEW.membership_end IS DISTINCT FROM OLD.membership_end
      OR NEW.purchased_analyses IS DISTINCT FROM OLD.purchased_analyses
      OR NEW.is_admin IS DISTINCT FROM OLD.is_admin
      OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
      OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
      OR NEW.maya_ki_enabled IS DISTINCT FROM OLD.maya_ki_enabled
      OR NEW.chat_messages_limit IS DISTINCT FROM OLD.chat_messages_limit
      OR NEW.max_events_override IS DISTINCT FROM OLD.max_events_override
      OR NEW.live_membership_until IS DISTINCT FROM OLD.live_membership_until THEN
      RAISE EXCEPTION 'Berechtigungen können nur serverseitig geändert werden';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_entitlements ON public.profiles;
CREATE TRIGGER protect_profile_entitlements
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_entitlements();
