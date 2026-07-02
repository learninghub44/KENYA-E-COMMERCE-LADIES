# Incident Response Guide

## Severity Levels

| Level | Label | Description | Response Time | SLA |
|-------|-------|-------------|---------------|-----|
| SEV1 | Critical | Site down, payment processing failure, data breach | 15 minutes | 2 hours |
| SEV2 | Major | Core feature broken (search, listings, checkout) | 30 minutes | 4 hours |
| SEV3 | Minor | Non-critical feature issue, degraded performance | 2 hours | 24 hours |
| SEV4 | Cosmetic | UI/UX bugs, typographical errors, minor styling | Next business day | 1 week |

## Response Team Roles

### Incident Commander (IC)
- Owns the incident from detection to resolution
- Coordinates response team, delegates tasks
- Makes go/no-go decisions (rollback, disable feature, notify users)
- Communicates status updates to stakeholders

### Technical Lead (TL)
- Diagnoses root cause
- Implements the fix or workaround
- Advises IC on technical impact and effort
- Provides technical details for post-mortem

### Communications Lead (CL)
- Drafts and sends status updates (internal and external)
- Monitors customer-facing channels for reports
- Maintains incident timeline
- Prepares post-incident customer communication

### Scribe
- Records all actions, decisions, and timestamps in the incident channel
- Maintains the incident log document
- Tracks action items and owners

## Response Phases

### 1. Detection
- Alert from monitoring system (Datadog, Sentry, Uptime Robot)
- User report via support ticket or social media
- Internal team member observation
- Automated health check failure

### 2. Triage
- Confirm the incident and determine severity
- Declare incident in `#incidents` Slack channel with `/incident declare`
- Assign IC, TL, CL, and Scribe roles
- Create incident channel `#incident-{short-description}`
- Post initial situation report (sitrep)

### 3. Containment
- Identify scope of impact (users, services, data)
- Apply immediate mitigation: rollback, feature flag off, block IP
- Stop bleeding before finding root cause
- Document containment actions in incident log

### 4. Eradication
- Identify root cause
- Deploy permanent fix
- Verify fix in staging before production
- Apply monitoring alerts to detect recurrence

### 5. Recovery
- Restore affected services to normal operation
- Verify all health checks pass
- Monitor systems for 30 minutes post-fix
- Declare incident resolved in incident channel

### 6. Post-Mortem
- Schedule post-mortem meeting within 5 business days
- Complete incident timeline
- Identify root cause, contributing factors, and gaps
- Assign action items with owners and due dates
- Publish post-mortem report in team wiki

## Communication Templates

### Initial Detection
```
INCIDENT DECLARED: [SEV#] - [Brief Title]
Description: [2-3 sentence description]
Impact: [affected services, users, regions]
Started: [timestamp]
Severity: [SEV1/SEV2/SEV3/SEV4]
IC: @name
TL: @name
Channel: #incident-[short-name]
```

### Status Update (during incident)
```
STATUS UPDATE - [time since declared]
Description: [what we know]
Action: [what we are doing]
Next Update: [time]
Status: [Investigating / Mitigating / Resolved / Monitoring]
```

### Resolution
```
INCIDENT RESOLVED - [incident name]
Duration: [X hours Y minutes]
Root Cause: [one-line summary]
Fix: [what was done]
Monitoring: [until timestamp]
Post-mortem: [scheduled date]
```

### Customer-Facing (SEV1 only)
```
We are aware of an issue affecting [service/feature]. Our team is actively investigating and will provide updates every [interval]. We apologize for the inconvenience.
```

## Escalation Contacts

| Role | Primary | Secondary | Backup |
|------|---------|-----------|--------|
| On-Call Engineer | @oncall-primary | @oncall-secondary | @oncall-backup |
| Engineering Manager | @eng-manager | @senior-eng | — |
| CTO | @cto | @vp-engineering | — |
| Security Lead | @sec-lead | @sec-engineer | — |
| Database Admin | @dba-lead | @dba-secondary | — |
| DevOps Lead | @devops-lead | @devops-engineer | — |

**Phone tree**: If primary is unreachable within 5 minutes, escalate to secondary. If secondary is unreachable within 5 minutes, escalate to engineering manager.

## Post-Incident Review Process

1. Schedule post-mortem within 5 business days of resolution
2. Participants: IC, TL, CL, Scribe, affected team members
3. Agenda:
   - Review incident timeline (detection, response, resolution)
   - Identify root cause
   - Identify what went well and what went wrong
   - Determine contributing factors (process, tooling, code)
   - Assign action items with owners and due dates
4. Deliverables:
   - Post-mortem document published in team wiki
   - Action items tracked in project management system
   - Blameless culture — focus on process improvements, not individuals

### Post-Mortem Template

```markdown
## Post-Mortem: [Incident Title]
- **Date**: YYYY-MM-DD
- **Severity**: SEV#
- **Duration**: X hours Y minutes
- **Impact**: [users affected, revenue impact, data exposure]

### Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Detection |
| HH:MM | Triage and severity assigned |
| HH:MM | Containment applied |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Services verified healthy |

### Root Cause
[detailed explanation]

### Contributing Factors
- Factor 1
- Factor 2

### What Went Well
- Bullet 1

### What Went Wrong
- Bullet 1

### Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | | | | ☐ |
```
