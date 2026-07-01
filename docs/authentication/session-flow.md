# Session Flow

```mermaid
sequenceDiagram
  participant Client
  participant AuthService
  participant SupabaseAuth
  participant Postgres

  Client->>AuthService: login(email, password)
  AuthService->>SupabaseAuth: signInWithPassword
  SupabaseAuth-->>AuthService: session + user
  AuthService->>Postgres: read user_roles
  AuthService->>Postgres: write activity_logs
  AuthService-->>Client: AuthSession
```

Access tokens are short lived and refreshed through Supabase Auth refresh rotation. Logout calls Supabase `signOut` with `local`, `global`, or `others` scope depending on whether the user wants to end the current session or all sessions.
