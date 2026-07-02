# Disaster Recovery Plan

## Overview

This document outlines the disaster recovery procedures for the Kenya E-Commerce Ladies platform. The plan covers detection, response, recovery, and post-mortem for each disaster scenario.

## DR Scenarios

### 1. Database Failure

**Scenario**: Primary database instance becomes unavailable, corrupts, or experiences performance degradation.

**Detection**:
- PagerDuty alert from uptime monitoring
- Sentry error spike (>5% error rate)
- Supabase dashboard health check failure
- User reports of login/checkout failures

**Recovery Procedure**:

1. **Verify Failure (5 min)**
   - Check Supabase dashboard for instance status
   - Run `SELECT 1` health query from multiple clients
   - Confirm with Supabase status page

2. **Failover to Read Replica (15 min)**
   - Promote read replica to primary in Supabase dashboard
   - Update connection strings in environment variables
   - Restart application servers to pick up new connection

3. **Database Restore (2-4 hours)**
   - If failover fails, initiate restore from latest backup
   - Download latest encrypted dump from S3
   - Decrypt and restore to new Supabase instance
   - Update DNS and connection strings
   - Verify data integrity with checksums and test queries

4. **Verify Recovery (30 min)**
   - Run full test suite against restored database
   - Verify Row-Level Security policies are intact
   - Confirm all triggers and functions are operational
   - Monitor error rates for 30 minutes post-recovery

**Rollback Plan**: Switch back to original instance if it recovers within the RTO window and data integrity is verified.

---

### 2. Cloud Provider Outage

**Scenario**: Supabase, Cloudinary, or Vercel experiences a regional outage.

**Detection**:
- Provider status page updates
- Multi-region health check failures
- Customer support ticket influx
- Internal monitoring dashboard shows all-red status

**Recovery Procedure**:

1. **Confirm Scope (10 min)**
   - Check provider status pages (Supabase, Vercel, Cloudinary, Cloudflare)
   - Verify if outage is regional or global
   - Assess impact on critical vs non-critical services

2. **Activate Static Fallback (30 min)**
   - Switch Cloudflare failover to static maintenance page
   - Enable queue mode for incoming orders (store in Redis)
   - Divert traffic to secondary region if available

3. **Failover to Secondary Provider (2-4 hours)**
   - **Supabase outage**: Spin up temporary PostgreSQL on AWS RDS, restore latest backup
   - **Vercel outage**: Deploy static build to Cloudflare Pages
   - **Cloudinary outage**: Serve images from S3 with Cloudflare image resizing

4. **Gradual Traffic Restoration (1-2 hours)**
   - Route 10% of traffic to recovered services
   - Monitor error rates and response times
   - Scale up gradually to full traffic

5. **Post-Recovery**
   - Process queued orders from Redis
   - Re-sync any data written during outage window
   - File status page incident report

**Rollback Plan**: Maintain static fallback page until provider confirms full resolution.

---

### 3. Security Breach

**Scenario**: Unauthorized access to user data, API keys, or administrative credentials.

**Detection**:
- Supabase audit log anomalies
- Unexpected API call patterns
- Intrusion detection system alerts
- User reports of unauthorized account activity
- GitHub secret scanning alerts

**Recovery Procedure**:

1. **Containment (15 min)**
   - Revoke all API keys and service tokens
   - Rotate Supabase project secrets
   - Invalidate all active sessions
   - Block suspicious IP ranges at Cloudflare WAF
   - Enable maintenance mode (prevent further data access)

2. **Investigation (1-2 hours)**
   - Review Supabase audit logs for unauthorized queries
   - Analyze Cloudflare access logs for attack patterns
   - Check GitHub access logs and commit history
   - Identify compromised accounts and data accessed
   - Preserve forensic evidence (log snapshots, server dumps)

3. **Remediation (2-4 hours)**
   - Patch vulnerability that enabled the breach
   - Rebuild compromised services from clean backup
   - Deploy updated WAF rules and rate limiting
   - Enable additional security monitoring
   - Force password reset for affected users

4. **Notification (within 24 hours)**
   - Notify affected users via email (per Data Protection Act 2019)
   - Report to Office of the Data Protection Commissioner (ODPC) if required
   - Update status page with incident timeline
   - Prepare security incident report for stakeholders

**Rollback Plan**: N/A — security breaches require forward remediation, not rollback.

---

### 4. Data Corruption

**Scenario**: Accidental or malicious data modification, migration failure, or application bug corrupts data.

**Detection**:
- Data validation checks failing
- User reports of incorrect prices/orders
- Referential integrity violations in logs
- Analytics showing anomalous data patterns

**Recovery Procedure**:

1. **Isolate Corruption (15 min)**
   - Identify affected tables and records
   - Determine corruption window (time range)
   - Place affected features behind feature flag
   - Create snapshot of corrupted state for analysis

2. **Point-in-Time Recovery (1-3 hours)**
   - Identify last known good timestamp from audit logs
   - Restore affected tables from PITR backup
   - Verify restored data integrity with checksums
   - Re-apply any legitimate transactions from corruption window

3. **Data Reconciliation (1-2 hours)**
   - Run reconciliation scripts to fix partial corruptions
   - Verify financial totals match payment provider records
   - Confirm order counts match before/after corruption window
   - User sampling to validate data correctness

4. **Prevention (post-recovery)**
   - Add database triggers to prevent invalid updates
   - Deploy additional validation in application layer
   - Update migration testing procedures

**Rollback Plan**: Full database restore from backup if PITR is insufficient.

---

### 5. Regional Outage

**Scenario**: AWS/Azure region failure affecting Supabase infrastructure or CDN edge nodes.

**Detection**:
- Cloudflare multi-region health checks failing
- Provider regional status page updates
- Increased latency from specific geographic regions

**Recovery Procedure**:

1. **Traffic Re-routing (15 min)**
   - Update Cloudflare load balancing rules
   - Fail traffic to healthy region's DNS endpoints
   - Enable Cloudflare Argo Smart Routing

2. **Secondary Region Activation (1-2 hours)**
   - Deploy application containers to secondary region
   - Restore database from cross-region backup replica
   - Point CDN to secondary origin

3. **Service Restoration (2-4 hours)**
   - Verify all critical API endpoints in secondary region
   - Confirm CDN cache warming is complete
   - Test payment processing in failover region
   - Gradually shift traffic back to primary on recovery

**Rollback Plan**: Keep secondary region active until primary is confirmed healthy for 24 hours.

---

## Communication Plan

### Escalation Matrix

| Priority | Condition | Contact | Response Time |
|----------|-----------|---------|---------------|
| P1 | Complete outage, data breach, payment failure | CTO + Engineering Lead | 15 min |
| P2 | Partial outage, degraded performance | Engineering Lead + Senior Engineer | 30 min |
| P3 | Non-critical feature down, cosmetic issues | On-call Engineer | 2 hours |
| P4 | Minor bugs, enhancement requests | Next sprint planning | 24 hours |

### Contact Channels

| Role | Primary Contact | Secondary Contact |
|------|----------------|-------------------|
| CTO | Phone + Signal | Slack DM |
| Engineering Lead | Phone + Slack | Email |
| On-call Engineer | PagerDuty | Slack DM |
| Product Manager | Slack DM | Email |
| Customer Support Lead | Slack | Phone |

### Status Page Updates

| Update Type | Frequency | Channel |
|-------------|-----------|---------|
| Incident detected | Immediate | Status page + #incidents Slack |
| Investigation started | Within 15 min | Status page |
| Root cause identified | Within 1 hour | Status page + email to stakeholders |
| Recovery in progress | Every 30 min | Status page |
| Resolved | Immediate | Status page + post-mortem scheduled |

---

## DR Testing Schedule

| Test Type | Frequency | Scope | Participants |
|-----------|-----------|-------|-------------|
| Tabletop exercise | Quarterly | Walk through DR scenarios, validate runbooks | Engineering + Product + Ops |
| Backup restore test | Weekly | Automated restore to staging | DevOps (automated) |
| Full recovery drill | Annually | Complete failover + restore + validation | Engineering + Security + Support |
| Security breach drill | Semi-annually | Simulated breach + containment + recovery | Engineering + Security |
| Payment failover test | Quarterly | Switch payment gateway fallback | Engineering + Finance |

### Annual Full Recovery Drill Procedure

1. Schedule 2 weeks in advance, notify all stakeholders
2. Announce maintenance window (Sunday 02:00–08:00 EAT)
3. Simulate primary database failure
4. Execute full recovery procedure from backup
5. Measure actual RTO/RPO against targets
6. Document gaps and update runbooks
7. Send post-drill report to all stakeholders

---

## Recovery Tiers

| Tier | Criticality | RTO | RPO | Services | Priority |
|------|-------------|-----|-----|----------|----------|
| Tier 1 | Critical | 4 hours | 1 hour | User auth, payments, orders, product catalog | Restore first |
| Tier 2 | Important | 24 hours | 4 hours | Messaging, reviews, seller dashboard, analytics | Restore second |
| Tier 3 | Normal | 72 hours | 24 hours | Admin panel, reporting, historical data, exports | Restore last |

### Tier 1 Services (4h RTO)
- User authentication and session management
- Payment processing (M-Pesa, card payments)
- Order creation and checkout flow
- Product catalog and search
- Seller wallet and payout operations

### Tier 2 Services (24h RTO)
- Buyer-seller messaging
- Product reviews and ratings
- Seller dashboard and analytics
- Recommendations engine
- Notification system

### Tier 3 Services (72h RTO)
- Admin panel and moderation tools
- Historical reporting and exports
- Audit logs (non-critical)
- Archived orders and conversations
- Marketing campaign management
