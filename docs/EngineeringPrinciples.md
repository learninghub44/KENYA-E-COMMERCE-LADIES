# Engineering Principles

**Status:** Approved

These are the values behind every other standards document. When a situation isn't covered
explicitly by a specific standard, fall back to these.

1. **Boundaries over speed.** Respecting module ownership and interfaces is more important
   than shipping a feature ten minutes faster by reaching into another module's code.
2. **The database is the source of truth for authorization.** Application-layer checks are a
   UX convenience; RLS is what actually protects data.
3. **Extractability, not premature distribution.** Build a clean modular monolith. Keep every
   module able to become its own service later. Don't build the microservice today if nothing
   requires it today.
4. **No silent open doors.** Any table without an explicit RLS policy, any endpoint without an
   explicit auth level, any error swallowed silently — these are bugs, not oversights to
   fix later.
5. **Write for the next engineer, not for yourself.** Every agent works largely
   asynchronously from the others. Code, PRs, and docs must be understandable without a
   conversation.
6. **Prefer boring, proven technology.** The stack is fixed (`Architecture.md`). Introducing a
   new library or pattern requires an ADR, not a personal preference.
7. **Measure before optimizing.** Performance work follows data (`Performance` agent's
   budgets and profiling), not intuition.
8. **Done means verified, not just written.** See `DefinitionOfDone.md`. "It compiles" is not
   "it works."
9. **Consistency beats local optimization.** A slightly less elegant solution that matches the
   established pattern is preferred over a clever one-off that only its author understands.
10. **Documentation is part of the deliverable, not an afterthought.** A feature without
    documented public interfaces is incomplete work.
