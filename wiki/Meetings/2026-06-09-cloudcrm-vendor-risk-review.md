---
type: meeting
created: 2026-06-09
updated: 2026-06-09
granola_id: demo-2026-06-09-cloudcrm-review
date: 2026-06-09
attendees: ["[[Dana Whitfield]]", "[[Jess Park]]", "[[Taylor Brooks]]", "[[Omar Haddad]]"]
para: ["[[CloudCRM Vendor Assessment]]", "[[Vendor Risk Management]]", "[[SOC 2 Reports]]"]
tags: [vendor-risk]
---

# CloudCRM Vendor Risk Review — 2026-06-09

## TL;DR

The team walked CloudCRM's SOC 2 Type II report and found two exceptions: terminated-user
access removal blew the 5-business-day SLA in 3 sampled cases, and log reviews ran
quarterly against a stated monthly policy. The standard tier has no SSO/SAML, which
drove the meeting's main decision: Coastal Ridge will only sign on the enterprise tier
with SSO enforced. The DPA needs a Canadian data-residency addendum. Overall risk
rating: **Medium**.

## Attendees

- [[Dana Whitfield]] (chair)
- [[Jess Park]] (assessment lead)
- [[Taylor Brooks]] (procurement)
- [[Omar Haddad]]

## Decisions

- **Enterprise tier with SSO/SAML enforced is a precondition of signature.** Standard
  tier is off the table.
- **Risk rating: Medium**, contingent on the risk acceptance for the log-review
  exception.

## Action items

- [ ] [[Taylor Brooks]] — negotiate enterprise-tier pricing with CloudCRM
- [ ] [[Jess Park]] — draft risk acceptance memo for the quarterly-vs-monthly log-review exception
- [ ] [[Omar Haddad]] — confirm SCIM provisioning support for automated offboarding

## Open questions

- Will CloudCRM commit to Canadian data residency in the DPA addendum, or only
  "commercially reasonable efforts"?
- Does their offboarding exception have a remediation date in the bridge letter?

## Notable quotes/context

- The offboarding exception matters more than it looks: CloudCRM will hold customer
  PII, and stale accounts are exactly how that leaks.
- Taylor flagged that sales ops wants this signed "yesterday" — pressure noted, not
  a reason to skip SSO.

## Links

- [[CloudCRM Vendor Assessment]] — findings, rating, conditions
- [[Vendor Risk Management]] — SOC 2 exception-handling pattern
- [[SOC 2 Reports]] — how to read Type II exceptions
- Raw transcript: `raw/transcripts/2026-06-09-cloudcrm-vendor-risk-review.md`

---

*Fictional demo content: Coastal Ridge Insurance and every person in this wiki are invented for training purposes. See the repo README.*
