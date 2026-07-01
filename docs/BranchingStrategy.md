# Branching Strategy

**Status:** Approved

## 1. Branches

- `main` — production. Always deployable. Protected: no direct pushes, requires PR + green CI.
- `develop` — integration branch. Protected: no direct pushes, requires PR + green CI.
- `feature/{module}-{short-description}` — e.g. `feature/orders-checkout-flow`. Branched from
  `develop`, merged back into `develop`.
- `fix/{module}-{short-description}` — non-urgent bug fixes, same flow as `feature/*`.
- `hotfix/{short-description}` — urgent production fix, branched from `main`, merged into
  `main` then back-merged into `develop`.
- `docs/{short-description}` — documentation-only changes.
- `chore/{short-description}` — tooling, deps, config.

## 2. Rules

- Branch names are always prefixed with the module they touch when applicable
  (`feature/catalog-...`, `fix/messaging-...`) so CODEOWNERS routing and history stay
  legible.
- One branch = one logical change. Don't mix an unrelated refactor into a feature branch.
- Rebase on `develop` before opening a PR if your branch has drifted; don't merge `develop`
  into your feature branch repeatedly — keep history clean.
- Branches are deleted after merge.

## 3. Commit Messages — Conventional Commits

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
Scope is the module: `feat(orders): add cursor pagination to order list`.

Examples:
```
docs: establish architecture standards
feat(catalog): add full-text search index on products
fix(auth): prevent session refresh race condition
```

Breaking changes are flagged with `!` after the type/scope and a `BREAKING CHANGE:` footer:
```
feat(api)!: rename product.sku to product.skuCode

BREAKING CHANGE: clients must update field name; see ADR-0007.
```
