const projectRef = "bruvmdcstlkszvjruska";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const queryRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `select u.email, a.area, a.status
from public.app_area_access a
join auth.users u on u.id = a.user_id
order by u.email, a.area;`,
  }),
});
console.log(await queryRes.text());
