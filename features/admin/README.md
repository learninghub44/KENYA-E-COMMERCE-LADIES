# Admin Feature

Agent 07 admin code lives in `lib/admin` and is exposed through repository-backed service
factories. UI routes should call these services from server-side handlers only.

The admin feature owns dashboard metrics, platform search, seller administration, user
administration, product moderation entry points, order administration, and internal notes.
Every privileged action must pass an `AdminActor` with normalized Agent 2 roles and must write
an audit record through the injected audit writer.
