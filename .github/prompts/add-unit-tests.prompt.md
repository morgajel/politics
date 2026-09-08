---
name: add-unit-tests
description: "Generate TypeScript/Vitest unit tests for existing code following this repository's conventions."
---

# Add Unit Tests

Generate focused tests for the specified TypeScript module or function. Prefer deterministic domain behavior and existing fixtures over browser or network tests.

## Input Required

- Target module or function
- Test type: unit, browser, integration, or both

## Test Standards

### Naming Convention
Use descriptive Vitest test names that state the scenario and expected result.

### Structure Requirements

1. **File Location**
   - Domain and utility tests: `tests/` using the existing `*.test.ts` convention.
   - Browser or integration tests: only when an existing runner and convention support them.

2. **Test APIs**
   ```typescript
   it("describes the expected behavior", () => {
     const result = functionUnderTest(input);
     expect(result).toEqual(expected);
   });
   ```

3. **Organization**
   - Group related behavior with `describe` blocks
   - Keep one behavior per `it` block

4. **Fixtures and dependencies**
   - Reuse `src/sample-data.ts` or create a focused local fixture when needed
   - Use Vitest mocks only for real module boundaries
   - Do not invent databases, HTTP endpoints, mock libraries, or framework-specific helpers

## Output Checklist

- [ ] Test file is under `tests/` and matches the Vitest configuration
- [ ] Existing imports, fixtures, and assertion style are followed
- [ ] Relevant happy path, invalid input, empty state, and boundary cases are covered
- [ ] Production code is unchanged unless explicitly requested
- [ ] `npm test` is run and its result is reported