const projectRef = "bruvmdcstlkszvjruska";
const token = process.env.SUPABASE_ACCESS_TOKEN;

const q = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
};

console.log(
  "profiles",
  await q(`select u.email, p.challenge_status, p.clinic_status
from public.profiles p join auth.users u on u.id = p.id order by u.email;`),
);

console.log(
  "fix",
  await q(`
ALTER TABLE public.profiles DISABLE TRIGGER profiles_protect_access_statuses;
UPDATE public.profiles p
SET challenge_status = 'approved',
    clinic_status = 'awaiting',
    challenge_start_date = (current_date - 54),
    onboarding_completed_at = coalesce(onboarding_completed_at, now())
FROM auth.users u
WHERE p.id = u.id AND u.email = 'appstore.review@thefeelgoodsociety.com.au';
ALTER TABLE public.profiles ENABLE TRIGGER profiles_protect_access_statuses;
`),
);

console.log(
  "after",
  await q(`select u.email, a.area, a.status
from public.app_area_access a
join auth.users u on u.id = a.user_id
where u.email = 'appstore.review@thefeelgoodsociety.com.au'
order by a.area;`),
);
