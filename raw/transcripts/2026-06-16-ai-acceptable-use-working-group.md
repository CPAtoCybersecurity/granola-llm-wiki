> **Fictional sample data.** This transcript was written for training/demo purposes. Coastal Ridge Insurance and all attendees are invented.

# AI Acceptable Use Working Group

- **Date:** 2026-06-16
- **Granola ID:** demo-2026-06-16-ai-working-group
- **Attendees:** Dana Whitfield, Jess Park, Sam Rivera, Omar Haddad

---

**Dana Whitfield:** Welcome to the first AI acceptable use working group. Small group, big topic. Sam, this is your show — the shadow-AI inventory was due today and I hear you delivered.

**Sam Rivera:** Delivered and slightly terrified. Let me share my screen. Is it showing the spreadsheet or my music player?

**Omar Haddad:** Spreadsheet. You're safe.

**Sam Rivera:** Small mercies. Okay — headline first: I found 17 unapproved AI tools in active use across the company.

**Dana Whitfield:** Seventeen. Say more.

**Sam Rivera:** Method was what we discussed: Omar pulled two months of DNS logs and the web filter's AI category hits, and I ran a short anonymous survey that got 214 responses, which is honestly more than I expected.

**Jess Park:** Anonymous worked, then. People confessed.

**Sam Rivera:** People really confessed. So, the 17 break down into four buckets: general chatbots, that's the biggest at seven tools; three transcription and note-taking apps; four browser extensions that summarize pages or rewrite emails; and three code assistants over in the actuarial tooling team.

**Omar Haddad:** The DNS data backs the volume, too — the top chatbot alone shows up from about ninety distinct machines.

**Dana Whitfield:** Okay. Where's the fire? Because I can feel you saving something.

**Sam Rivera:** The fire is the free-tier chatbots. Multiple survey respondents — from claims — said they paste claims notes into free chatbots to summarize them or draft customer letters. Claims notes as in names, policy numbers, incident details. Customer data, straight into free consumer AI tools.

**Jess Park:** And the free tiers are the worst place for it. Most of them retain prompts and can train on them. There's no enterprise agreement, no deletion rights, nothing.

**Dana Whitfield:** How many people are we talking about?

**Sam Rivera:** Hard to say precisely with an anonymous survey, but at least six respondents described doing it, and the phrasing suggests it's routine in one claims pod, not a one-off.

**Omar Haddad:** So customer data is leaving the building daily through a browser tab. That's the sentence for the executive summary.

**Dana Whitfield:** That's the sentence, yeah. Okay. Before anyone says it — we are not banning everything. Prohibition just drives it underground, and the productivity gain is real. Jess, you looked at frameworks?

**Jess Park:** I did, and I want to propose a traffic-light tiering model for AI tools. Green: approved tools, vetted, contracted, fine for business use within documented limits. Yellow: allowed with conditions — specific use cases, no customer data, that kind of thing. Red: banned outright, blocked at the filter.

**Sam Rivera:** I like that it's explainable in one breath. People remember three colors.

**Omar Haddad:** And it's enforceable, which matters to me. Red maps to a blocklist. Yellow maps to a warning page with a link to the conditions. Green just works. I can implement that.

**Dana Whitfield:** Where do the free-tier chatbots land?

**Jess Park:** Red, immediately — at least for any free tier with data retention. If we get an enterprise agreement with one of the major providers, that instance becomes green and gives people a sanctioned place to go. You can't take away the tool without offering the replacement.

**Dana Whitfield:** Agreed on all of it. Decision: we adopt the traffic-light tiering — green approved, yellow with conditions, red banned. Jess, that's the spine of the policy.

**Jess Park:** Perfect, because that's exactly how I structured the draft. I'll have AI acceptable use policy v0.2 ready by June 30. Version 0.1 was my skeleton — v0.2 incorporates today plus the inventory.

**Dana Whitfield:** June 30 works. Sam, follow-on for you: the inventory can't be a one-time snapshot. Turn it into a maintained tool register — living document, every tool with its tier, owner, and review date.

**Sam Rivera:** On it. I already built the spreadsheet with that in mind, so it's mostly adding the tier column and a review cadence. Can the register live on the intranet so people can check a tool's color before using it?

**Jess Park:** Yes — and that becomes the enforcement story too. 'Check the register' is a much easier ask than 'read the policy.'

**Dana Whitfield:** Good instinct. What about training? Policy nobody's heard of is just a PDF.

**Jess Park:** Proposal: a security-awareness training module specifically on AI use — what the tiers mean, why pasting customer data into a chatbot is a breach, how to request a new tool. Target it for the fall onboarding cycle so every new hire gets it from day one, and run existing staff through it the same season.

**Dana Whitfield:** Fall onboarding, locked. Okay — before we close, Omar, you asked for five minutes on infrastructure.

**Omar Haddad:** Yeah, and I'll rip the bandage off: the MFA rollout is slipping. New target is mid-July.

**Jess Park:** Wait — didn't we say end of June two weeks ago? I wrote it down.

**Omar Haddad:** We did, and that was the plan, and then the legacy VPN appliance happened. Turns out it doesn't support the authenticator app we standardized on — the firmware only speaks an older token protocol. Found out Tuesday when the first field-adjuster batch tried to enroll and the VPN just rejected the second factor.

**Dana Whitfield:** Options?

**Omar Haddad:** Two. Firmware upgrade, which the vendor says maybe supports it and I don't love 'maybe.' Or replace the appliance, which was budgeted for next fiscal anyway — I'm trying to pull that forward. Either path lands us at mid-July for full MFA coverage. Everyone not behind that VPN is already done, for what it's worth — we're at 71% overall.

**Dana Whitfield:** Alright. Not thrilled, but a real dependency beats a fake deadline. Flag it in the ops report so leadership hears it from us first, and let's log the date change formally — I don't want June 30 living on in three different slide decks.

**Jess Park:** I'll note the revised date in the risk register commentary too, since MFA coverage feeds two of our open risks.

**Omar Haddad:** Appreciated. And for the record, I did threaten the appliance with early retirement. It was unmoved.

**Sam Rivera:** Firmware has no fear. That's the first thing you learn.

**Dana Whitfield:** Okay, tangent budget spent. Recap: Sam's inventory found 17 unapproved AI tools, worst case being claims notes pasted into free-tier chatbots. We're adopting traffic-light tiering — green, yellow, red. Jess drafts AI acceptable use policy v0.2 by June 30. Sam converts the inventory into a maintained tool register. AI security-awareness module targeted for fall onboarding. And MFA completion moves to mid-July because of the legacy VPN appliance.

**Jess Park:** One more for the minutes — we should thank the survey respondents. Two hundred fourteen honest answers is a culture win, even if some of the answers were alarming.

**Dana Whitfield:** Agreed, I'll put a thank-you in the all-staff note. Honesty got us a real map instead of a guess.

**Sam Rivera:** And nobody named names, as promised. The claims pod remains anonymous and hopefully soon retrained.

**Omar Haddad:** I'll get the red-tier blocklist staged this week so it's ready the moment the policy publishes. No enforcement before the policy, though — promise.

**Dana Whitfield:** Right order of operations. Good meeting, everyone. Same group, two weeks, to review Jess's draft.

**Sam Rivera:** I'll bring the register. And a working screen share, ideally.

**Dana Whitfield:** Dream big. Thanks, all.
