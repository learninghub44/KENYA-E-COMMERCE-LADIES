# Maintenance Mode

## Overview

Three maintenance modes for production control:

| Mode         | Effect                              |
|--------------|-------------------------------------|
| `global`     | All traffic blocked, banner shown   |
| `read_only`  | Reads allowed, writes blocked       |
| `scheduled`  | Planned window, not yet active      |

## API

- `GET /internal/platform/maintenance` — check active maintenance
- `POST /internal/platform/maintenance` — enable/disable

```json
POST /internal/platform/maintenance
{ "action": "enable", "type": "global", "message": "Scheduled maintenance" }

POST /internal/platform/maintenance
{ "action": "disable" }
```

## Admin Bypass

Admin and super_admin roles bypass maintenance mode restrictions.

## Auditing

All maintenance mode changes are recorded in `platform_audit_log`.
