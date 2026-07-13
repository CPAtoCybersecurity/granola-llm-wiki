> **Fictional sample data.** This transcript was written for training/demo purposes. Coastal Ridge Insurance and all attendees are invented.

# CloudCRM Vendor Risk Review

- **Date:** 2026-06-09
- **Granola ID:** demo-2026-06-09-cloudcrm-review
- **Attendees:** Dana Whitfield, Jess Park, Taylor Brooks, Omar Haddad

---

**Dana Whitfield:** Okay, this is the CloudCRM vendor risk review. Taylor, thanks for making time — I know procurement's slammed this month.

**Taylor Brooks:** Four vendor reviews this week, and this is honestly the fun one. You security folks ask better questions than the furniture supplier did.

**Dana Whitfield:** We try. Quick setup: Jess ran the assessment, Omar's here for identity and integration questions, I'm here to make decisions. Jess, walk us through it.

**Jess Park:** Will do. Screen coming up — and yes, I checked which window this time. Everyone see the summary page?

**Omar Haddad:** Got it.

**Taylor Brooks:** Yep.

**Jess Park:** So. CloudCRM sent back the completed questionnaire, and on Friday I got their SOC 2 Type II report under NDA. Audit period is July 2025 through March 2026, done by a reputable firm.

**Dana Whitfield:** And the verdict?

**Jess Park:** Clean-ish. Two exceptions.

**Taylor Brooks:** 'Clean-ish' is a wonderful word for a compliance document.

**Jess Park:** Exception one: terminated-user access removal. Their control commits to removing access within five business days of termination. The auditor found that access removal exceeded the 5-business-day SLA in 3 sampled cases — one took nine days, one twelve, and one fifteen.

**Omar Haddad:** Fifteen days? A former employee with live access to a CRM full of customer data for three weeks, basically?

**Jess Park:** For that one sample, yes. To be fair, their management response says they've since automated deprovisioning off their HR system feed. But the exception stands for the audit period.

**Dana Whitfield:** Noted. What's exception two?

**Jess Park:** Log reviews. Their own policy says admin activity logs get reviewed monthly. The auditor found the reviews actually happened quarterly during the period.

**Omar Haddad:** So the control exists on paper and gets exercised a quarter of the time. Classic.

**Jess Park:** Right. Their response says they're hiring a second security analyst to fix the cadence, but as of the report it's quarterly.

**Dana Whitfield:** Okay, park both exceptions — we'll come back to disposition. What else came out of the questionnaire?

**Jess Park:** Mostly reasonable. Encryption at rest, TLS 1.2 plus in transit, annual pen test with a summary letter they'll share. But there's one big structural issue: the standard tier — the one sales budgeted for — has no SSO or SAML support at all. Local usernames and passwords only.

**Omar Haddad:** Wait, seriously? No SAML in 2026?

**Jess Park:** Not on standard. SSO and SAML are enterprise tier features.

**Omar Haddad:** Then the standard tier is a hard no from me. Forty-plus sales people with yet another standalone password, no MFA enforcement we control, and no central kill switch when someone leaves. And remember exception one — their own deprovisioning runs slow. I want offboarding in our hands, through our identity provider, not theirs.

**Dana Whitfield:** That's a compelling way to put it. The SOC 2 exception and the missing SSO are the same risk wearing two hats.

**Taylor Brooks:** Let me get ahead of the obvious question — the price delta. Enterprise runs roughly forty percent more per seat. Sales budgeted about $38,000 a year for standard; enterprise puts us somewhere around $53,000.

**Dana Whitfield:** Fifteen thousand a year is the cost of doing this properly. I'll defend that number to anyone who asks.

**Taylor Brooks:** Oh, they'll ask.

**Dana Whitfield:** Then here's the decision: we require the enterprise tier, with SSO and SAML enforced, before contract signature. Not 'enabled later,' not 'on the roadmap.' Enforced, and written into the contract.

**Taylor Brooks:** I can work with that. Honestly it gives me a negotiation angle — CloudCRM would rather upsell us than lose the deal entirely. I'll push on the per-seat price.

**Omar Haddad:** While you're in there — ask about SCIM. If we're paying for enterprise, I want automated provisioning and deprovisioning from our identity provider, not a manual admin console. I've got a call Thursday with their solutions engineer, Priya, so I'll confirm SCIM support directly.

**Dana Whitfield:** Good. Action for you then: confirm SCIM provisioning support. Next topic — data residency. Jess?

**Jess Park:** Their primary hosting is US East. A Canadian region is quote-unquote 'available on request.' And the draft DPA they sent doesn't mention residency at all.

**Dana Whitfield:** We're a Canadian insurer holding Canadian customer data. That's not a nice-to-have. The DPA needs a Canadian data-residency addendum before this goes anywhere near a signature.

**Taylor Brooks:** Legal will want that anyway — they flagged residency on the last three SaaS deals. If you draft the requirement language, Jess, I'll route it into the contract package.

**Jess Park:** Can do. I'll have addendum language to you by Wednesday.

**Dana Whitfield:** Now, back to the two SOC 2 exceptions. Disposition. Omar, you made the case that the access-removal exception is largely mitigated if we control deprovisioning ourselves through SSO and SCIM.

**Omar Haddad:** Right. If their SLA slips, it doesn't matter much — we cut the SAML assertion and the account is dead from our side same day. Their internal offboarding speed becomes their problem, not ours.

**Dana Whitfield:** Agreed. So that one's mitigated by the enterprise-tier condition. What about the log-review exception?

**Jess Park:** That one we can't engineer around — it's their internal monitoring cadence. My suggestion is a formal risk acceptance memo: time-bound, revisit when their next SOC 2 report lands, with their hiring commitment noted as the remediation path.

**Dana Whitfield:** Draft it and I'll sign as risk owner. Better an honest documented acceptance than pretending the exception isn't there.

**Taylor Brooks:** You people document your acceptances? The furniture vendor just told me the warranty was 'vibes-based.'

**Jess Park:** We're a fun bunch.

**Dana Whitfield:** Okay — overall rating. Jess, where does the scoring land?

**Jess Park:** Medium. Data sensitivity is high because of customer contact and policy data, but with the enterprise tier, SSO and SAML enforced, the residency addendum, and the documented acceptance on log reviews, the residual risk profile scores out as a Medium. It was trending High before the tier condition.

**Omar Haddad:** Medium feels right. I'd have said High on the standard tier without blinking.

**Dana Whitfield:** Medium it is, conditions documented. Before we wrap — Omar, you were about to say something and I cut you off earlier?

**Omar Haddad:** Just that the backup vendor renewal also landed on my desk and their questionnaire is — no. Actually, different meeting. Withdrawn.

**Dana Whitfield:** Appreciated. Recap of actions: Taylor negotiates enterprise-tier pricing with SSO and SAML as contract conditions. Jess drafts the risk acceptance memo for the log-review exception plus the Canadian data-residency addendum language for the DPA. Omar confirms SCIM provisioning support on Thursday's call.

**Taylor Brooks:** And I'll keep sales calm while we do it. They want a signature by end of month, so speed matters.

**Jess Park:** Memo and addendum by Wednesday, so the ball's in CloudCRM's court fast.

**Dana Whitfield:** Perfect. Good session, everyone — this is exactly how I want vendor reviews to run. Thanks, Taylor.

**Taylor Brooks:** Any time. I'll bring the furniture vendor's questionnaire next time for comedy value.
