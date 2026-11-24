const projectRef = "bruvmdcstlkszvjruska";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `
CREATE OR REPLACE FUNCTION public.protect_profile_access_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.challenge_status IS DISTINCT FROM OLD.challenge_status
     OR NEW.clinic_status IS DISTINCT FROM OLD.clinic_status THEN
    RAISE EXCEPTION 'Access status can only be changed by an admin';
  END IF;
  RETURN NEW;
END;
$$;
`,
  }),
});
console.log(res.status, await res.text());
