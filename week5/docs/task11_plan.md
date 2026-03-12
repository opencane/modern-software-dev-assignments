# Task 11 Plan: Deployable on Vercel

## Current State

- **Frontend**: React 18 + Vite builds to `frontend/dist`
- **Backend**: FastAPI serves static files from `frontend/dist` and exposes API routes
- **API Client**: Uses empty `API_BASE` (relative paths)
- **No Python dependencies file**: No `pyproject.toml` or `requirements.txt` exists

## Recommended Approach: Vercel Serverless Functions

Vercel supports Python serverless functions natively. This is the cleanest approach.

---

## Step 1: Add Python Dependencies File

**File: `requirements.txt`** (new file)

```
fastapi>=0.104.0
uvicorn>=0.24.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
```

---

## Step 2: Create Vercel API Entry Point

**File: `api/index.py`** (new file)

- Import the FastAPI app from `backend/app/main.py`
- The file should expose the `app` object for Vercel's Python runtime
- Configure CORS to allow the Vercel frontend origin

---

## Step 3: Update vite.config.js for Environment Variables

**File: `frontend/vite.config.js`**

```javascript
export default defineConfig({
  base: './', // Ensure relative paths work
  // ... existing config
});
```

**File: `frontend/src/api.js`**

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
```

---

## Step 4: Create vercel.json Configuration

**File: `vercel.json`** (new file)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": { "runtime": "python3.9" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/frontend/dist/assets/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/index.html"
    }
  ]
}
```

---

## Step 5: Configure Vercel Project Settings

In Vercel dashboard:
1. Set **Framework Preset** to "Other"
2. Set **Build Command**: `cd frontend && npm install && npm run build`
3. Set **Output Directory**: `frontend/dist`
4. Add environment variables:
   - `VITE_API_BASE_URL` = `/api` (for serverless) or external API URL

---

## Step 6: Add Deploy Guide to README.md

Update `README.md` with deployment instructions including:
- Prerequisites (Vercel account, CLI)
- Environment variables needed
- Build commands
- Rollback procedures

---

## Alternative Approach (Option B)

If using an external API service (e.g., Render, Fly.io):
1. Skip creating `api/index.py`
2. Set `VITE_API_BASE_URL` to the external API URL in Vercel
3. Remove the Python build from `vercel.json`

---

## File Changes Summary

| File | Action |
|------|--------|
| `requirements.txt` | Create - Python dependencies for Vercel |
| `api/index.py` | Create - Vercel serverless function entry point |
| `frontend/vite.config.js` | Modify - Add base path configuration |
| `frontend/src/api.js` | Modify - Use `import.meta.env.VITE_API_BASE_URL` |
| `vercel.json` | Create - Vercel routing and build configuration |
| `README.md` | Modify - Add deploy guide section |

---

## Critical Files

- `frontend/vite.config.js` - Vite configuration to modify
- `frontend/src/api.js` - API client to update with env variable support
- `backend/app/main.py` - FastAPI app to import in Vercel function
- `README.md` - Existing README to extend with deploy guide
- `frontend/package.json` - Reference for build scripts
