---
name: problem-first-analysis
description: "Diagnose problems in a product, website, campaign, document, workflow, or other artifact before proposing prioritized, evidence-backed solutions. Use when the user asks for an analysis, audit, review, diagnosis, or improvement plan."
---

# Problem First Analysis

Analyze first, solve second. The purpose is to help the user understand what is wrong, why it matters, and what to do next. Do not jump directly to a redesign, list generic best practices, or treat an assumption as a finding.

## Core workflow

1. Define the object being analyzed and the decision the analysis should support.
   Identify the audience, desired outcome, constraints, and success condition. If the request is underspecified but a useful diagnosis is still possible, proceed with explicit assumptions and ask only the smallest necessary follow-up at the end.

2. Establish the evidence base.
   Separate findings into:
   - Observed fact: directly visible in the supplied artifact or a reliable source.
   - Inference: a reasoned interpretation of one or more facts.
   - Unknown: information needed to confirm or reject an inference.

   For external or time-sensitive subjects, use current sources when needed and cite claims near the relevant finding. For supplied material, inspect the material itself before relying on general advice.

3. Map the problems.
   For every meaningful problem, state:
   - Symptom: what the user or customer experiences.
   - Evidence: the concrete observation supporting it.
   - Likely root cause: why it is happening, labeled as an inference when not directly proven.
   - Impact: what it costs in clarity, trust, conversion, time, quality, risk, or maintainability.
   - Confidence: high, medium, or low.

   Do not list a symptom and its downstream effects as separate problems. Collapse related observations into one root-cause problem where appropriate.

4. Prioritize before recommending.
   Rank problems using a practical combination of impact, urgency, reach, confidence, and effort. Use P0/P1/P2 or a similarly clear scale. P0 means a blocking or credibility-damaging issue; P1 means a high-leverage issue; P2 means useful polish or longer-term improvement.

5. Design solutions that map back to causes.
   Each recommendation must name the problem it addresses and include:
   - The proposed change.
   - Why it addresses the root cause.
   - Trade-offs or risks.
   - A concrete implementation sequence.
   - An acceptance test or measurable signal.

   When multiple solutions are reasonable, give a recommended option and one meaningful alternative with the trade-off. Avoid prescribing tools or features that the user did not ask for unless they are necessary to solve a diagnosed problem.

6. Close the loop.
   End with a short execution order, what to measure, and which unknowns should be validated next. If implementation was not requested, do not silently modify files, publish content, send messages, or make external changes.

## Required response shape

Use the smallest structure that remains complete, normally:

### Conclusion

Give the overall diagnosis in 1–3 sentences. Lead with the most important issue and the main opportunity.

### Problems found

Use a table when there are multiple findings:

| Priority | Problem / root cause | Evidence | Impact | Confidence |
|---|---|---|---|---|

Keep the table specific to the artifact. Do not fill it with generic advice.

### Recommended solutions

Map each solution to a problem ID or named root cause. Include the change, rationale, trade-off, and acceptance test.

### Execution order

Give a short sequence such as: fix blockers → clarify positioning → add proof → improve conversion → measure and iterate.

### Open questions

Only include questions whose answers could materially change the diagnosis or recommendation. Otherwise state assumptions and continue.

## Website and product audits

When analyzing a website, inspect the live page or supplied screenshots/files before judging it. Cover only the dimensions relevant to the request, but usually check:

- Positioning: Can a first-time visitor identify what is sold, for whom, and why it is credible within seconds?
- Information architecture: Are products, use cases, proof, FAQs, and contact paths easy to find and logically ordered?
- Product clarity: Are product facts, ranges, compatibility, use conditions, exclusions, and pricing/quote logic explicit?
- Trust: Are company identity, certifications, cases, service scope, contact details, and claims verifiable?
- Conversion: Is there a clear next action with low decision cost for the intended customer?
- Search and AI readability: Are headings, summaries, tables, FAQ content, canonical URLs, structured data, robots rules, and sitemap consistent with the visible facts?
- Technical experience: Is the site reachable, mobile-friendly, secure, fast enough, accessible, and free of broken links or stale domain references?

For GEO or AI-search analysis, distinguish technical crawlability from actual ranking or recommendation performance. Structured data and crawler access improve machine readability but do not guarantee citation, ranking, traffic, or sales. Never repeat market-share, order, traffic, or conversion claims as facts without a reliable source.

## Guardrails

- Diagnose before redesigning. A prettier surface is not a solution unless the diagnosis shows a presentation problem.
- Prefer primary evidence and quote only the minimum needed to anchor a finding.
- Do not invent product specifications, customer names, certifications, prices, traffic, rankings, testimonials, or case results.
- Mark stale, conflicting, or inaccessible sources explicitly; do not hide uncertainty behind confident wording.
- Do not overfit a single example into a universal rule.
- Do not confuse “not found” with “does not exist”; phrase it as “not visible in the reviewed material.”
- Keep the tone direct and useful. The user should understand what to fix first and how to know it worked.
