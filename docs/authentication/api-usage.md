# API Usage

The auth service is framework-agnostic so route handlers can stay thin.

```ts
const service = createAuthService({ auth, profiles, roles, audit });

const result = await service.login({
  email: body.email,
  password: body.password,
  rememberMe: body.rememberMe
});
```

Route handlers should map `AuthResult` directly into the project API response shape:

```json
{ "data": { "...": "..." }, "meta": {} }
```

or:

```json
{ "error": { "code": "AUTHORIZATION_DENIED", "message": "The current user does not have access." } }
```
