# Plan: Task 1 - Migrate Frontend to Vite + React

## Context
The project currently uses vanilla JavaScript for the frontend (in `frontend/index.html`, `frontend/app.js`, `frontend/styles.css`). Task 1 requires migrating to a Vite + React application with proper build tooling and test coverage.

## Current State
- **Frontend**: Vanilla JS in `frontend/` serving static files via FastAPI
- **Backend**: FastAPI with routers at `/notes` and `/action-items`
- **API Endpoints**:
  - `GET /notes/`, `POST /notes/`, `GET /notes/{id}`, `GET /notes/search/`
  - `GET /action-items/`, `POST /action-items/`, `PUT /action-items/{id}/complete`
- **Makefile**: Has `run`, `test`, `format`, `lint`, `seed` targets

## Implementation Plan

### Phase 1: Scaffold Vite + React App
1. Create `frontend/` subdirectory structure for React:
   - Use `npm create vite@latest frontend -- --template react`
   - This creates `frontend/` with standard Vite + React structure
2. Install dependencies: `npm install`

### Phase 2: Configure Vite Build
1. Update `frontend/vite.config.js`:
   - Set `build.outDir` to `dist` (default)
   - Configure base path if needed for deployment
2. Add build scripts to `frontend/package.json`:
   - `build`: `vite build`
   - `preview`: `vite preview`

### Phase 3: Migrate Frontend Code
1. Create React components in `frontend/src/`:
   - `App.jsx` - Main app with routing
   - `components/NotesList.jsx` - List, create notes
   - `components/NoteEdit.jsx` - Edit/delete note
   - `components/ActionItemsList.jsx` - List, create, complete action items
   - `api.js` - API helper functions
2. Copy `frontend/styles.css` content to `frontend/src/index.css`
3. Update `frontend/src/main.jsx` to render App

### Phase 4: Update FastAPI for React Build
1. Modify `backend/app/main.py`:
   - Change static mount from `frontend` to `frontend/dist`
   - Update root endpoint to serve `frontend/dist/index.html`
2. Ensure build process runs before server starts

### Phase 5: Update Makefile
Add new targets:
```makefile
web-install:
	cd frontend && npm install

web-dev:
	cd frontend && npm run dev

web-build:
	cd frontend && npm run build

run: web-build
	PYTHONPATH=. poetry run uvicorn backend.app.main:app --reload --host $${HOST:-127.0.0.1} --port $${PORT:-8000}
```

### Phase 6: Add Tests - COMPLETED
1. **Frontend tests** (in `frontend/src/__tests__/`):
   - `NotesList.test.jsx` - 6 tests for note list rendering and CRUD operations
   - `ActionItemsList.test.jsx` - 8 tests for action items rendering and CRUD operations
   - Uses React Testing Library + Vitest
2. **Backend integration tests** (in `backend/tests/`):
   - Added tests for trailing slash redirects (`/notes` → `/notes/`, etc.)
   - Existing tests cover API compatibility

## Critical Files to Modify
- `backend/app/main.py` - Update static file serving
- `Makefile` - Add web targets
- `frontend/` - Create new Vite + React app

## Verification
1. Run `make web-install` to install dependencies
2. Run `make web-build` to build React app
3. Run `make run` to start server and verify frontend loads
4. Run `npm test` in frontend directory for component tests
5. Run `make test` for backend API tests
