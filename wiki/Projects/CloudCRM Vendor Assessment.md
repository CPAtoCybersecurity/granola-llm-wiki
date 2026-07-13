---
type: project
created: 2026-06-02
updated: 2026-06-18
status: active
para_type: project
---

# CloudCRM Vendor Assessment

Security review of CloudCRM (SaaS CRM entering via sales ops) ahead of contract
signature. Lead: [[Jess Park]] with [[Taylor Brooks]]. Kicked off 2026-06-02, reviewed
2026-06-09. **Risk rating: Medium.**

## Findings (SOC 2 Type II)

1. **Offboarding exception** — terminated-user access removal exceeded the
   5-business-day SLA in 3 sampled cases. The one that matters: CloudCRM will hold
   customer PII, and stale accounts are a leak path.
2. **Log-review exception** — reviews ran quarterly against a stated monthly policy.
   Handled via risk acceptance memo ([[Jess Park]], in draft).
3. **No SSO/SAML on standard tier.**

## Conditions of signature (decided 2026-06-09)

- Enterprise tier with **SSO/SAML enforced** — precondition, non-negotiable.
- DPA amended with a **Canadian data-residency addendum**.

## Status synthesis — filed from query, 2026-06-18

> Q: *"What's blocking the CloudCRM signature?"* — answered from this wiki and filed
> back here per the query operation in `CLAUDE.md`.

Three blockers, three owners: enterprise-tier pricing ([[Taylor Brooks]], negotiating),
risk acceptance memo for the log-review exception ([[Jess Park]], drafting), and SCIM
provisioning confirmation ([[Omar Haddad]], asked). The data-residency addendum rides
the pricing negotiation. Nothing is waiting on the vendor's SOC 2 remediation.

## Open items

- [ ] [[Taylor Brooks]] — enterprise-tier pricing
- [ ] [[Jess Park]] — risk acceptance memo (log-review exception)
- [ ] [[Omar Haddad]] — SCIM provisioning confirmation
- [ ] Data-residency commitment language: firm, or "commercially reasonable efforts"?

## Sources

- [[2026-06-02-security-team-weekly-sync]] (intake) ·
  [[2026-06-09-cloudcrm-vendor-risk-review]] (review) · [[SOC 2 Reports]] ·
  [[Vendor Risk Management]]

---

*Fictional demo content: Coastal Ridge Insurance and every person in this wiki are invented for training purposes. See the repo README.*
