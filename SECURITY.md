# Security Policy

## Supported Versions

Zuri Market is developed on a continuous basis. Only the latest release
on the `main` branch is actively supported with security fixes.

| Version | Supported |
| --- | --- |
| Latest (`main`) | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability in Zuri Market, please report
it responsibly and **do not open a public GitHub issue**.

Instead:

1. Report privately via GitHub's [Security Advisories](../../security/advisories/new)
   feature for this repository, if you have access, **or**
2. Contact the Owner directly (see [`OWNER.md`](./OWNER.md)) with:
   - A description of the vulnerability
   - Steps to reproduce it
   - Potential impact
   - Any suggested remediation, if known

## What to Expect

- **Acknowledgment:** We aim to acknowledge new reports within 3
  business days.
- **Assessment:** We will assess severity and confirm the issue,
  requesting more information from you if needed.
- **Resolution:** Fix timelines depend on severity — critical issues
  affecting user data or payment flows (e.g. M-Pesa integrations) are
  prioritized above all other work.
- **Disclosure:** We ask that you give us reasonable time to remediate
  before any public disclosure. We will credit reporters who wish to be
  credited, once a fix is released.

## Scope

This policy covers the Zuri Market application, APIs, and infrastructure
configuration contained in this repository. Vulnerabilities in
third-party dependencies should also be reported to us, but may need to
be reported upstream as well.

For our internal security architecture (authentication, RLS policies,
authorization model), see [`docs/Security.md`](./docs/Security.md).
This file covers vulnerability *reporting*; that one covers how the
system is *built* to be secure.

## Out of Scope

- Social engineering attacks against staff or users
- Denial-of-service testing against production or staging environments
- Automated vulnerability scanning that generates significant load
  against live systems without prior coordination

Thank you for helping keep Zuri Market and its users safe.
