---
name: verify-cross-stack
description: Verify Studentory backend, frontend, or cross-stack changes with the repository's canonical checks and report actionable failures. Use after implementation or when establishing a baseline.
---

# Verify Studentory changes

Run the narrowest relevant scope first:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1 -Scope backend
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1 -Scope frontend
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1 -Scope all
```

Use `-Install` only when dependency installation or synchronization is explicitly needed. It may require network access.

For a failure:

1. Report the failing command and concise error.
2. Determine whether it is caused by the current change, the existing baseline, missing local tooling, or environment configuration.
3. Fix only failures within the task's scope.
4. Re-run the failed check, then the appropriate broader scope.

Never claim a check passed without running it. Record relevant commands and results in `docs/LOOP_LOG.md` during a Goal loop.
