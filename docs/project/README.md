# Project Documentation

**Status:** Approved
**Applies to:** Zuri Market — all engineers, operators, and reviewers

This folder is the single entry point into Zuri Market's documentation. Each guide below
is a concise, task-oriented summary; where a topic has deeper standalone documentation
elsewhere in `docs/`, the guide links straight to it instead of duplicating it.

## Guides

| Guide | What it answers |
| --- | --- |
| [Project Overview](./Overview.md) | What is Zuri Market, who is it for, what state is it in? |
| [Architecture Summary](./ArchitectureSummary.md) | How is the system put together, and why? |
| [Development Guide](./DevelopmentGuide.md) | How do I get the app running and contribute code? |
| [Deployment Guide](./DeploymentGuide.md) | How does this get from a laptop to production? |
| [Maintenance Guide](./MaintenanceGuide.md) | How is the running system kept healthy day to day? |
| [Scaling Guide](./ScalingGuide.md) | How does this hold up as usage grows? |
| [Security Guide](./SecurityGuide.md) | How is the platform and its data protected? |
| [Repository Standards](./RepositoryStandards.md) | How is the repository itself organized and governed? |

## How this folder relates to the rest of `docs/`

`docs/project/` is a curated summary layer, not a replacement for the detailed,
domain-specific documentation already in this repository:

- Per-domain deep dives live in `docs/authentication/`, `docs/database/`, `docs/kyc/`,
  `docs/marketplace/`, `docs/messaging/`, `docs/platform/`, and similar folders.
- Production operations runbooks live in `docs/production/`.
- Architecture decisions are recorded individually in `docs/adr/`.
- Historical build notes from each engineering pass live in `docs/handoffs/`.

If a summary here and a detailed doc it links to ever disagree, the detailed doc is
authoritative — please open an issue or ADR (see [Repository Standards](./RepositoryStandards.md))
so the discrepancy gets resolved rather than silently diverging further.

## Back to the top

Return to the [project README](../../README.md) for installation, environment variables,
and the full documentation index.
