---
name: new-feature
description: "Use when defining a new feature request: ask clarifying questions, produce an actionable feature brief, and create a backlog item in morgajel's Politics GitHub Project."
user-invocable: true
---

# New Feature Skill

## Purpose

Turn an initial feature idea into a clarified, actionable backlog item for the Politics project.
The target project is [Politics](https://github.com/users/morgajel/projects/2), owned by `morgajel`.

## Required workflow

1. Restate the feature request in one sentence and identify the intended user or operator.
2. Ask focused clarifying questions before creating the backlog item. Do not ask questions whose answers
   are already present in the request or repository documentation.
3. Resolve the minimum details needed to make the work actionable:
   - problem and user value
   - desired behavior and non-goals
   - acceptance criteria
   - technical or hosting constraints
   - dependencies and affected areas
   - priority and sequencing
   - validation or test expectations
4. Inspect relevant repository documentation and existing implementation surfaces when available.
5. Draft the backlog item and show it to the user for confirmation when requirements are materially
   ambiguous or the item would commit the project to a significant architectural choice.
6. Create one backlog item in the Politics GitHub Project after the required details are available.
7. Report the created item's title, project, URL or identifier, priority, and any unresolved assumptions.

## Clarifying questions

Ask only the questions needed for the current request. Prefer a compact batch such as:

- What user problem does this solve, and who is the primary user?
- What should happen in the successful path?
- What should explicitly remain out of scope?
- Are there data, hosting, privacy, accessibility, performance, or timeline constraints?
- What dependencies or existing screens, APIs, or modules are involved?
- What priority should this receive? Use FIFO by default when no other project rule is specified.
- How should completion be validated or tested?

For this repository, preserve known constraints such as GitHub Pages hosting, TypeScript, U.S.-only
political data, and local-edit-only agent behavior unless the user explicitly changes them.

## Backlog item format

Use a concise, implementation-ready issue body:

```markdown
## Problem
<user problem and value>

## Proposed outcome
<behavior the feature should provide>

## Acceptance criteria
- [ ] <observable criterion>
- [ ] <observable criterion>

## Out of scope
- <explicit non-goal>

## Technical notes
- <constraints, dependencies, affected areas, or data considerations>

## Validation
- <test or verification step>

## Assumptions and open questions
- <only unresolved items>
```

The title should be specific and action-oriented, normally in the form `Feature: <short outcome>`.
Do not combine unrelated feature requests into one backlog item.

## Priority and sequencing

- Use FIFO when the user does not specify another priority rule.
- Preserve explicit urgency or impact information from the user.
- Escalate security, privacy, data-integrity, or deployment blockers even when FIFO would otherwise apply.
- Do not invent a priority field or project status value; use the target project's existing fields when
  available and report any field that cannot be set.

## GitHub Project creation

Create the item in `morgajel`'s Politics project:

`https://github.com/users/morgajel/projects/2`

Use the available authenticated GitHub/project integration when one is configured. If project-management
tools are unavailable, authentication is missing, or the environment cannot access GitHub, do not claim
that the item was created. Instead, output the finalized title and issue body plus the exact project URL,
and state the blocking limitation.

Never expose tokens, credentials, or private API responses in the backlog item or final response.

## Completion checks

- The request was clarified enough to be actionable.
- The title describes one feature and the body includes acceptance criteria.
- Technical constraints and non-goals are recorded.
- Validation steps are included.
- The item was created in the Politics project, or the inability to create it was reported honestly.
- The final response includes unresolved assumptions and the created item reference when available.

## Example prompts

- "Define a feature that lets users compare two politicians' overall voting agreement."
- "Create a backlog item for adding stale-data warnings to the GitHub Pages comparison tool."
- "Turn this rough idea into a Politics project feature: <idea>."

## Related customizations

- `project-planning`: expand a feature into milestones, dependencies, and an implementation plan.
- `government-ngo-api-python.agent.md`: investigate public-sector API contracts and data provenance.
- A future `feature-implementation` skill: turn an approved backlog item into code and tests.

## Revision history

- v0.1: Initial workspace skill for clarifying feature requests and creating Politics project backlog items.
