# Middleware

Every API route or protected page declares one auth level:

- `public`
- `authenticated`
- `seller`
- `admin`

Use `authorizeRoute` from `middleware/auth-guard.ts` after resolving the Supabase session and roles. Permission-specific routes pass `permissions` with one permission or a list of required permissions.

Route guards are not the final security boundary. RLS policies must still deny unauthorized row access.
