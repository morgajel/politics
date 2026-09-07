# Project Planning Skill

Purpose
-------
Help an agent gather complete, actionable project requirements from a user so the project-manager
agent can produce a plan, milestones, and implementation tasks.

When to use
-----------
- The user needs a scoped plan, acceptance criteria, and a prioritized task list for a feature or fix.
- The user is unsure about tech choices, constraints (e.g., GitHub Pages), or acceptance criteria.

Outcome
-------
A concise project brief containing: goal, success criteria, constraints, tech choices, milestones, tasks,
priority, and a minimal test plan or validation checklist.

Step-by-step process
--------------------
1. Collect high-level goal and business/user value.
2. Ask for constraints and assumptions (hosting, schedules, budget, data/privacy).
3. Elicit acceptance criteria and success metrics (what 'done' looks like).
4. Discover existing artifacts (repos, docs, examples, tests).
5. Propose technology options if none chosen (with tradeoffs), then confirm user's choice.
6. Break the work into milestones and discrete tasks with estimates and dependencies.
7. Prioritize tasks (by chosen rule) and produce a short TODO list.
8. Produce a minimal test/validation checklist for each milestone.

Decision points & branching logic
--------------------------------
- If tech is unspecified → offer 2–3 vetted options and ask the user to pick.
- If scope is vague → propose a small MVP scope and ask for approval.
- If constraints include GitHub Pages → limit recommendations to static-site approaches.
- If multiple requests exist → follow repository prioritization rule (ask user: urgency, impact, owner-assigned).

Quality criteria / completion checks
----------------------------------
- Project brief contains goal, acceptance criteria, constraints, chosen tech, milestones, and tests.
- Every task is actionable and small enough for a single commit-local edit.
- Tests or validation steps exist for each milestone where applicable.

Clarifying questions (ask the user)
----------------------------------
- What is the primary goal and measured success for this project?
- What constraints must we respect (hosting, legal, timelines)?
- Do you already prefer a technology stack? If not, do you prefer minimal dependencies or modern tooling?
- How should concurrent requests be prioritized? (urgency/impact/FIFO/owner-assigned)
- Do you want the agent to create branches and PRs, or edit files locally only?

Outputs produced by this skill
----------------------------
- Project brief (one-page) with acceptance criteria and constraints.
- Prioritized TODO list suitable for `manage_todo_list`.
- Milestone breakdown with estimates and a validation checklist.

Examples prompts
---------------
- "Plan a GitHub Pages–hosted MVP to display legislative stats, include milestones and test checklist."
- "Help me scope a small static site to show candidate profiles, propose tech options and a 2-week plan."

How to iterate
---------------
1. Present the draft brief and TODOs to the user.
2. Ask for missing details or corrections; update the brief.
3. Convert tasks into `manage_todo_list` items and start implementation once approved.

Next suggested customizations
---------------------------
- Add templates for common project types (static site, data ETL, API client).
- Add estimators (small/medium/large) with suggested hour ranges.
- Implement a `CODE_STYLE` checklist template for the repo.

Revision history
----------------
- v0.1: Initial skill draft created by assistant.
