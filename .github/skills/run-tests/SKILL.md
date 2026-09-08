---
name: run-tests
description: "Run the appropriate project tests and coverage checks. Use when asked to run tests, verify a change, inspect test failures, or delegate coverage analysis."
argument-hint: "Describe the tests or changed area to verify"
user-invocable: true
disable-model-invocation: false
---

# Run Tests

Run the repository's appropriate automated tests and give the user an accurate result. Use this skill for requests such as `run tests`, `run the test suite`, `verify the change`, or `check coverage`.

## Procedure

1. Inspect the repository's test configuration and `package.json` or equivalent build manifest. Identify the test runner, available test scripts, relevant test files, and any coverage script.
2. Identify the changed or requested area. Prefer the narrowest relevant test command first when the repository supports it.
3. Delegate coverage-gap analysis or test-selection advice to the repository's `test-coverage` agent when available. Treat its recommendations as project guidance, but follow the current repository's language and test tooling rather than assuming the agent's framework defaults.
4. Execute the focused test command. If it passes, execute the full test suite when the request is broad or when the focused result does not cover the requested behavior.
5. Run the project's coverage command when explicitly requested or when coverage is part of the repository's validation scripts. Do not invent a coverage threshold.
6. If a command fails, distinguish test failures, type-check/build failures, missing dependencies, and unavailable command execution. Include the failing command and the meaningful failure summary.
7. Do not modify production code or tests while running validation. If a fix is requested after a failure, stop the test workflow and handle that as a separate implementation task.

## Output Contract

Report:

- Commands executed, in order
- Pass/fail result for each command
- Test counts or coverage summary when the runner provides them
- The first actionable failure, including its file or test name when available
- Any command that could not run and why
- A concise remaining-risk note when no executable validation was available

Never claim a test passed unless the command actually completed successfully. Diagnostics or static analysis may be reported separately from test execution.
