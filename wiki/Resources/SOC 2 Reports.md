---
type: resource
created: 2026-06-09
updated: 2026-06-09
para_type: resource
tags: [vendor-risk]
---

# SOC 2 Reports

How this team reads a vendor's SOC 2 Type II report. Reference page for
[[Vendor Risk Management]].

## Read the exceptions, don't count them

A clean opinion with a fine-print exception can matter more than a long exception list
of trivia. From the CloudCRM review:

- **Offboarding SLA misses** → direct leak path when the vendor holds your customers'
  PII. Weight: high.
- **Log-review cadence drift** (quarterly vs. stated monthly) → process discipline
  signal. Weight: moderate; handled by documented risk acceptance with an owner.

## Questions to ask on any exception

1. Does it touch our data directly, or the vendor's internal hygiene?
2. Is there a remediation date in the bridge letter?
3. Condition of signature, risk acceptance, or walk-away?

## Sources

- [[2026-06-09-cloudcrm-vendor-risk-review]] · [[CloudCRM Vendor Assessment]]

---

*Fictional demo content: Coastal Ridge Insurance and every person in this wiki are invented for training purposes. See the repo README.*
