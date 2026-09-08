---
description: "Analyze reported user feedback and implement the appropriate features to resolve it"
name: "Resolve User Feedback"
argument-hint: "Describe the user feedback to investigate and resolve"
agent: "agent"
---
A user reported this feedback:
${input:feedback}

Analyze the feedback in the context of this repository and resolve it through the smallest appropriate product change.

Workflow:
1. **DO NOT MAKE CHANGES AT THIS STAGE** Identify the underlying user need, the affected workflow, and the likely code path. Do not treat every suggestion in the feedback as a requirement; distinguish symptoms, requested behavior, and implied acceptance criteria.
2. **DO NOT MAKE CHANGES AT THIS STAGE** Inspect the relevant implementation, nearby tests, and repository instructions before editing. Reuse existing patterns, domain types, and UI conventions.
3. **DO NOT MAKE CHANGES AT THIS STAGE** State a concise implementation hypothesis and one focused check that could disconfirm it.
4. Checkpoint: Report the concise hypothesis and check to the user for confirmation before implementing.
5. Implement the necessary feature or behavior. Keep the scope limited to the reported problem and preserve existing public behavior unless the feedback requires a change.
6. Add or update focused tests for the new behavior, including relevant edge cases. Do not weaken or delete existing tests.
7. Run the narrowest useful validation first, then any broader project checks needed to confirm the change.

Requirements:
- Do not invent product requirements when the feedback is ambiguous. Ask targeted clarifying questions only when the ambiguity blocks a safe implementation; otherwise make the smallest reasonable assumption and record it.
- Do not modify unrelated code, dependencies, or documentation unless required by the resolved feature.
- Follow the repository's existing architecture, naming, accessibility, and responsive design conventions.
- Preserve data integrity and existing API contracts unless a contract change is explicitly required by the feedback.

When finished, report:
- What the feedback meant and which behavior changed.
- Files changed and the important implementation decisions.
- Tests or validation run and their results.
- Any assumptions, remaining limitations, or follow-up work.
