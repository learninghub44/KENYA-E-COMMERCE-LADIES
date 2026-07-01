# Seller Future Expansion Notes

- Promote high-query metadata fields such as `businessCategory`, `visibility`, and address country to
  first-class indexed columns once real query patterns are known.
- Add a staff/admin review service that owns transitions from `under_review` to `approved` or `rejected`.
- Add team-member invitations after the messaging/notification domain exists.
- Add product publishing checks in Agent 04 using seller status `approved` and KYC status `approved`.
- Keep business verification optional until supported countries and legal entity rules are finalized.
- Add provider signature verification in the future KYC webhook route before calling the KYC service.
