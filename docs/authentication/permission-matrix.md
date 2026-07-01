# Permission Matrix

| Permission | Buyer | Seller | Moderator | Support | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|---:|
| `auth.session.read` | yes | yes | yes | yes | yes | yes |
| `auth.session.revoke` | yes | yes | yes | yes | yes | yes |
| `auth.password.update` | yes | yes | yes | yes | yes | yes |
| `auth.email.update` | yes | yes | yes | yes | yes | yes |
| `auth.account.deactivate` | yes | yes | no | no | no | yes |
| `auth.account.delete` | yes | no | no | no | no | yes |
| `seller.auth.register` | yes | no | no | no | no | no |
| `seller.profile.manage` | no | yes | no | no | no | no |
| `product.create` | no | yes | no | no | no | no |
| `product.update` | no | yes | no | no | no | no |
| `product.delete` | no | yes | no | no | no | no |
| `admin.access` | no | no | yes | yes | yes | yes |
| `admin.moderate` | no | no | yes | no | yes | yes |
| `admin.support` | no | no | no | yes | yes | yes |
| `admin.role.manage` | no | no | no | no | yes | yes |
| `security.audit.read` | no | no | yes | yes | yes | yes |
| `security.audit.write` | no | no | no | no | yes | yes |
| `security.lockout.manage` | no | no | no | no | yes | yes |
