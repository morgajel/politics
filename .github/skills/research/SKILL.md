---
name: research
description: "Use when researching a proposed feature before implementation: identify dependencies, answer requisite questions, surface risks, and break the work into implementation-ready sub-issues without changing product code."
user-invocable: true
---

# Feature Research Skill

## Purpose

Investigate a feature request enough to make implementation planning reliable. This skill produces
evidence-backed findings, identifies unresolved decisions and dependencies, and decomposes the feature
into ordered sub-issues. It does not implement the feature or silently make product decisions for the user.

## When to use

- A feature has unclear technical, product, data, API, hosting, or integration requirements.
- The team needs a dependency map and implementation breakdown before coding.
- A project manager needs to know what must be decided, validated, or prototyped first.

## Required workflow

1. Restate the feature and define the research question.
2. Inspect relevant repository files, documentation, configuration, tests, and existing abstractions.
3. Identify external dependencies, including APIs, packages, services, permissions, credentials, data sources,
   deployment limits, and legal or licensing considerations.
4. Ask only the requisite clarifying questions that block a reliable breakdown. Group questions by decision.
5. Research external contracts or current documentation when access is available. Record the source, date
   checked, and the specific claim supported by each source.
6. Separate confirmed facts, reasonable assumptions, options, and unresolved questions.
7. Identify risks, unknowns, failure modes, and the cheapest spike or validation step for each major unknown.
8. Delegate specialist questions to the appropriate subagent when the repository or feature domain warrants
   expertise beyond general research. Include the subagent's findings as attributed evidence, then reconcile
   conflicts before making recommendations.
9. Decompose the feature into small, ordered sub-issues with dependencies and completion criteria.
10. Present the research report for review. Stop at research unless the user explicitly asks for implementation.

## Subagent delegation

Use `runSubagent` for focused research that benefits from specialist context. Give each subagent a bounded,
read-only research assignment and request findings, sources, assumptions, risks, and recommended follow-up
spikes. Do not delegate the entire feature without a clear research question.

Preferred routing:

| Research need | Subagent | Expected contribution |
| :--- | :--- | :--- |
| Government, nonprofit, civic, policy, or public-sector APIs | `Government NGO API Python` | API contracts, auth, pagination, rate limits, provenance, normalization, and integration risks |
| Repository structure, existing abstractions, tests, or configuration | `Explore` | Relevant files, current patterns, dependencies, and likely ownership boundaries |
| Test strategy, behavior specifications, or acceptance scenarios | `tdd-planner` or `bdd-specialist` | Testable scenarios, edge cases, and validation gaps without implementing product code |
| Existing or proposed HTML report/interface behavior | `html-expert` | Accessibility, browser behavior, document structure, and presentation constraints |
| Existing or proposed Markdown documentation | `markdown-expert` | Documentation structure, terminology, and maintainability considerations |
| Hytale server infrastructure | `Hytale Server Agent` | Hytale-specific deployment, configuration, and operational dependencies |
| Palworld server infrastructure | `palworld expert` | Palworld-specific administration, configuration, and operational risks |
| Minigames plugin mechanics or UI | `Slopsmith Minigames` | Plugin architecture, game mechanics, and relevant implementation dependencies |

Routing rules:

- Use the narrowest specialist that matches the question; use `Explore` first when repository ownership is
  unclear.
- Delegate independent research questions in parallel when possible, but keep each assignment self-contained.
- Ask specialists to research and report only unless the user explicitly requests implementation separately.
- Do not delegate secrets, credentials, or private data. Redact sensitive values from prompts and findings.
- Treat subagent output as research evidence, not approval. Verify important claims against repository files or
  authoritative external documentation.
- If no listed subagent fits, perform the research directly and record why delegation was not appropriate.
- Record which subagent was consulted and summarize its contribution in the final report's confirmed findings
  or assumptions.

## Decision points and branching logic

- If the repository already has an abstraction for the feature area, prefer extending it over introducing a
  parallel pattern.
- If the feature depends on an external API, verify authentication, CORS, rate limits, pagination, schemas,
  freshness, terms, and stable identifiers before recommending direct integration.
- If secrets or server-side processing are required but hosting is static (such as GitHub Pages), identify a
  safe proxy, scheduled static-data pipeline, or scope change; never put credentials in frontend code.
- If multiple viable technologies exist, compare at most three options by fit, complexity, maintenance,
  operational risk, and migration cost, then state the preferred option without treating it as approved.
- If a dependency or behavior cannot be verified, label it unknown and create a spike sub-issue instead of
  inventing an endpoint, field, or capability.
- If the request is too broad, propose an MVP boundary and list deferred capabilities as follow-up issues.
- If a security, privacy, legal, data-integrity, or deployment blocker is found, place it before implementation
  work in the dependency order and call it out prominently.

## Requisite questions

Ask questions only when their answers change the dependency graph or sub-issue plan. Typical questions include:

- Who is the primary user and what outcome defines success?
- What is explicitly in scope for the first release, and what is deferred?
- Which environments, hosting targets, browsers, or devices must work?
- What freshness, availability, scale, privacy, accessibility, or compliance requirements apply?
- Which source systems or APIs are approved, and are credentials or permissions available?
- What existing module, data contract, UI, or deployment workflow should this integrate with?
- What validation evidence is required before implementation can begin?

If answers are unavailable, document the assumption and create a decision or spike sub-issue.

## Research report format

Use this structure:

```markdown
# Feature Research: <feature>

## Research question
<what must be understood before implementation>

## Findings
### Confirmed
- <fact> [source or repository path]

### Assumptions
- <assumption and why it is currently necessary>

### Options and recommendation
- Option A: <tradeoffs>
- Option B: <tradeoffs>
- Preferred: <option and rationale>

## Dependencies
- <dependency, owner, status, and blocking impact>

## Risks and unknowns
| Item | Impact | Likelihood | Cheapest validation |
| :--- | :--- | :--- | :--- |
| <unknown> | <impact> | <likelihood> | <spike or check> |

## Requisite questions
- [ ] <question that needs an answer>

## Sub-issues
1. **<title>**
   - Depends on: <issue or none>
   - Deliverable: <concrete output>
   - Completion criteria: <observable checks>

## Recommended order
1. <decision or spike>
2. <implementation issue>

## Deferred scope
- <follow-up capability>
```

## Sub-issue quality criteria

- Each sub-issue has one clear deliverable and an observable completion criterion.
- Dependencies are explicit and ordered; blockers appear before dependent implementation work.
- Research, decision, implementation, and validation work are distinguished.
- A sub-issue is small enough to estimate and review independently.
- No sub-issue assumes an unverified API, package behavior, permission, or data field.
- Deferred scope is recorded rather than quietly included in the MVP.

## Boundaries

- Do not modify application code, configuration, dependencies, or deployment files while using this skill.
- Read-only repository inspection and external research are allowed when available.
- Do not create a GitHub issue or project item unless the user explicitly requests that follow-up and the
  appropriate project-management workflow is available.
- Do not expose credentials, private data, or tokens in research notes.

## Completion checks

- The research question and feature boundary are explicit.
- Relevant repository and external dependencies are identified.
- Confirmed facts are distinguished from assumptions and unknowns.
- Blocking questions and risks have owners or validation steps where possible.
- The feature is decomposed into ordered, actionable sub-issues.
- The report states what is ready for implementation and what remains blocked.

## Example prompts

- "Research the proposed politician voting comparison feature and break it into sub-issues. Do not code."
- "Before implementing live API data, identify the APIs, CORS constraints, rate limits, and required spikes."
- "Investigate adding topic filters to the comparison tool and tell me what must be decided first."

## Related customizations

- `project-planning`: turn approved research into milestones and an implementation plan.
- `new-feature`: clarify a feature request and create a Politics project backlog item.
- `government-ngo-api-python.agent.md`: investigate government and nonprofit API contracts in depth.
- `Explore`: inspect repository structure and existing implementation patterns.

## Revision history

- v0.1: Initial workspace skill for feature research and sub-issue planning.
