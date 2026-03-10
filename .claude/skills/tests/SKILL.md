---
name: tests
description: Run pytest with coverage. Usage: /tests [marker] [path]
argument-hint: marker or path
---

Run the test suite with coverage:

1. Determine the test arguments:
   - If $ARGUMENTS is provided, use it as additional pytest args (e.g., a marker like `-m unit` or a path like `tests/unit/`): `poetry run pytest $ARGUMENTS --maxfail=1 -x`
   - If no arguments, run without extra filters: `poetry run pytest`

2. If tests FAIL:
   - Summarize the failure (test name, error message, file:line)
   - Suggest next steps: check the error, fix the test or implementation
   - Do NOT run coverage

3. If tests PASS:
   - Run coverage report:
     ```
     coverage run -m pytest -q backend/tests $ARGUMENTS
     coverage report -m
     ```
   - Summarize coverage results (total %, any low coverage areas)

4. Report summary:
   - For failures: "[TEST NAME] failed - [brief error]. Suggestion: [fix approach]"
   - For passes: "[X] tests passed. Coverage: [X]%"

