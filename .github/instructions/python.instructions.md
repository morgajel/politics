---
description: Conventions for python scripts
applyTo: '**/*.py'
---

## Python Script Conventions

1. **Shebang**: Use `#!/usr/bin/env python3`. add Module-level docstringon the next line as a one-sentence summary.

2. **CLI arguments**: Use `argparse` for all CLI argument handling. Never read `sys.argv` directly. Import `sys` and `os` explicitly.

3. **Error output**: Write errors to `sys.stderr`. Exit with `sys.exit` with a unique error code for each error.

4. **Input sanitisation**: Validate hostnames and usernames passed to `subprocess` with a strict regex allowlist before use (e.g. `r'^[a-z0-9.-]'`). Raise `ValueError` on mismatch.
