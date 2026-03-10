---
name: refactor-module
description: This skill should be used when the user asks to "rename a module", "move a file", "refactor module", or needs to rename a Python module and update all imports.
---

# Refactor Module Skill

Rename a Python module (file) and update all imports across the codebase.

## When This Skill Applies

This skill activates when the user's request involves:
- Renaming a Python module (e.g., `services/extract.py` → `services/parser.py`)
- Moving a module to a different directory
- Updating imports after a module rename

## Steps

### 1. Identify the module to rename

The user should provide:
- **Source**: Current module path (e.g., `backend/app/services/extract.py`)
- **Destination**: New module path (e.g., `backend/app/services/parser.py`)

### 2. Find all imports of the module

Search for imports using the old module name:
```bash
grep -r "from.*extract" --include="*.py"
grep -r "import.*extract" --include="*.py"
```

### 3. Rename the file

Use git mv to preserve history:
```bash
git mv old_path new_path
```

### 4. Update all imports

For each file that imports the old module:
- `from ... import X` → `from ... import X` (module name changed)
- Update any relative import paths if the directory changed

### 5. Run linter/ formatter

```bash
poetry run ruff check .
poetry run ruff format .
```

### 6. Run tests

```bash
poetry run pytest -q backend/tests
```

## Output Checklist

Provide a summary of changes:

- [ ] Renamed file: `old_path` → `new_path`
- [ ] Updated imports in:
  - `file1.py`
  - `file2.py`
- [ ] Ran linter: passed/failed
- [ ] Ran tests: passed/failed

## Notes

- If the module has tests, rename those too (e.g., `test_extract.py` → `test_parser.py`)
- Check for any references in configuration files, documentation, or CI/CD
- Verify the new module name follows project naming conventions
