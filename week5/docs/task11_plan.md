# Task 11: Deployable on Cloud (Medium-Complex)

## Overview

Deploy the React frontend and FastAPI backend on cloud platforms.

Two approaches are supported:
- **Option A**: Vercel (frontend) + Fly.io (backend) - Already documented below
- **Option B**: AWS Lightsail (both frontend + backend) - Cost-optimized, all-in-one

---

## Deployment Options Comparison

| Component | Option A (Vercel + Fly.io) | Option B (AWS Lightsail) |
|-----------|----------------------------|-------------------------|
| Frontend | Vercel | S3 + CloudFront |
| Backend | Fly.io | Lightsail Instance |
| Database | SQLite on Fly.io | SQLite on Lightsail |
| Monthly Cost | ~$5/mo | ~$5/mo |
| Complexity | Medium | Low |
| Free Tier | Limited | 3 months (new accounts) |

### Recommendation

**Option B (AWS Lightsail)** is recommended for:
- Simpler architecture (single platform)
- More predictable pricing
- Easier debugging (SSH access)
- Better for new AWS accounts (3 months free)

---

## Recommended Approach: Option A (Vercel + Fly.io)

### Why Option A?

1. **SQLite Persistence**: Vercel's serverless functions have ephemeral filesystem - SQLite data would be lost on each request
2. **Cold Start Performance**: FastAPI on Vercel's Python runtime has significant cold start latency
3. **Fly.io Benefits**:
   - Native Python support with persistent volumes
   - Can run SQLite with proper persistence
   - Single platform for backend + database
4. **Frontend Optimization**: Vercel excels at static frontend delivery with edge caching

---

## Files to Create/Modify

### 1. Frontend Configuration

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/frontend/vite.config.js` (MODIFY)
- Add `base` configuration for Vercel deployment
- Configure environment variable injection

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/frontend/package.json` (MODIFY - optional)
- Already has build/preview scripts
- Add `vercel` dev dependency if needed

### 2. Vercel Configuration

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/vercel.json` (CREATE)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-BACKEND.fly.dev/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

### 3. Backend Configuration for Fly.io

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/Dockerfile` (CREATE)
- Multi-stage build for Python/FastAPI
- Install dependencies from requirements.txt

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/fly.toml` (CREATE)
- Fly.io configuration
- Volume mount for SQLite persistence

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/requirements.txt` (CREATE)
- Python dependencies for FastAPI deployment
- Used by both local development and Fly.io

### 4. CORS Configuration

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/backend/app/main.py` (MODIFY)
- Update CORS settings to allow Vercel frontend origin
- Example: `allow_origins=["https://your-project.vercel.app"]`

### 5. Documentation

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/README.md` (MODIFY)
- Add deployment guide section

---

## Vercel Configuration Details

### Project Structure for Vercel

The Vercel deployment will be configured with:
- **Project Root**: `/home/dd/lab/modern-software-dev-assignments/week5` (root of repo)
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (runs in frontend directory via package.json scripts)
- **Output Directory**: `frontend/dist`

### vercel.json Structure

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://backend-app.fly.io/:path*"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

### Alternative: Frontend-Only vercel.json

If frontend is in a separate Vercel project:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "env": {
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

---

## Option B: AWS Lightsail (Cost-Optimized)

### Architecture

```
User → CloudFront (CDN) → Lightsail Instance (FastAPI + SQLite)
```

### Pricing

| Resource | Monthly Cost |
|----------|--------------|
| Lightsail Instance (Python 3.11) | ~$5 |
| Static IP | Free |
| Data Transfer | Included |

**Total: ~$5/month** (or free for 3 months with new AWS account)

### Files to Create/Modify

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/deployment/aws/fastapi.service` (CREATE)
- systemd service file for FastAPI

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/deployment/aws/setup.sh` (CREATE)
- Startup script for instance initialization

**File**: `/home/dd/lab/modern-software-dev-assignments/week5/README.md` (MODIFY)
- Add AWS deployment guide

### AWS Lightsail Setup

#### 1. Create Instance

1. Go to AWS Lightsail console
2. Create new instance:
   - **Blueprint**: Ubuntu 22.04 LTS (or Python 3.11 if available)
   - **Instance Plan**: $5/month (3 GB RAM, 2 vCPUs)
   - **Name**: fastapi-app

#### 2. Security Group Configuration

| Port | Protocol | Source |
|------|----------|--------|
| 80 | TCP | Internet (HTTP) |
| 443 | TCP | Internet (HTTPS) |
| 22 | TCP | Your IP (SSH) |

#### 3. Setup Script (userdata)

```bash
#!/bin/bash
set -e

# Install Python and dependencies
apt-get update
apt-get install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Clone repository
cd /home/ubuntu
git clone <your-repo-url> week5
cd week5

# Install Python dependencies
pip3 install -r requirements.txt

# Create data directory
mkdir -p data

# Setup systemd service
cp ../deployment/aws/fastapi.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable fastapi
systemctl start fastapi

# Setup Nginx reverse proxy
cp ../deployment/aws/nginx.conf /etc/nginx/sites-available/default
nginx -t
systemctl reload nginx
```

#### 4. systemd Service File

**File**: `deployment/aws/fastapi.service`
```ini
[Unit]
Description=FastAPI Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/week5
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10
Environment="PYTHONUNBUFFERED=1"
Environment="DATABASE_PATH=/home/ubuntu/week5/data/app.db"

[Install]
WantedBy=multi-user.target
```

#### 5. Nginx Configuration

**File**: `deployment/aws/nginx.conf`
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /home/ubuntu/week5/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Optional: S3 + CloudFront for Frontend

For better performance, host frontend on S3 with CloudFront CDN:

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-app-frontend
   aws s3 sync frontend/dist s3://your-app-frontend --delete
   ```

2. **Configure S3 for Static Hosting**:
   - Enable "Static website hosting"
   - Set index.html as index document

3. **Create CloudFront Distribution**:
   - Origin: S3 bucket website endpoint
   - Cache Policy: CachingOptimized
   - SSL: CloudFront default or custom ACM certificate

### AWS Cost Optimization Tips

1. **Use Free Tier**: New AWS accounts get 3 months free on Lightsail
2. **Reserved Instances**: Commit to 1 year for ~30% savings
3. **Stop When Not Needed**: Lightsail instances can be stopped/started
4. **Monitor Usage**: Set billing alerts at $10, $20, $50

### Environment Variables (Lightsail)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | SQLite file path | `/home/ubuntu/week5/data/app.db` |
| `PYTHON_ENV` | Environment | `production` |

---

## Environment Variables

### Vercel (Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://myapp.fly.io` |
| `VITE_API_BASE_URL` (in Vite) | Injected at build time | Set in Vercel dashboard |

### Fly.io (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | SQLite file path | `./data/app.db` |
| `PYTHON_ENV` | Environment | `production` |

---

## Build Configuration Changes

### Vite Configuration (frontend/vite.config.js)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Required for static deployment
  build: {
    outDir: 'dist',  // Output to frontend/dist relative to package.json location
    emptyOutDir: true,
  },
  // Environment variable injection
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || 'http://localhost:8000'
    ),
  },
  server: {
    proxy: {
      '/notes': 'http://localhost:8000',
      '/action-items': 'http://localhost:8000',
      '/tags': 'http://localhost:8000',
    },
  },
});
```

### Package.json Scripts (frontend/package.json)

Ensure these scripts exist (already present):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Deploy Guide Outline

### Prerequisites

**Option A (Vercel + Fly.io)**:
- Vercel account
- Fly.io account
- Node.js 18+
- Python 3.11+

**Option B (AWS Lightsail)**:
- AWS account
- Node.js 18+
- Python 3.11+

### Option A: Deploy to Vercel + Fly.io

#### Step 1: Deploy Backend to Fly.io

1. Install Fly CLI: `npm install -g flyctl`
2. Authenticate: `flyctl auth login`
3. Create app: `flyctl apps create my-backend-app`
4. Deploy: `flyctl deploy`
5. Note the URL (e.g., `https://my-backend-app.fly.dev`)

#### Step 2: Configure CORS

Update `backend/app/main.py` to allow Vercel origin:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Step 3: Deploy Frontend to Vercel

1. Connect repository to Vercel
2. Configure settings:
   - Framework: Vite
   - Build Command: `npm run build` (runs in frontend directory)
   - Output Directory: `frontend/dist`
3. Add environment variables:
   - `VITE_API_BASE_URL`: Your Fly.io backend URL
4. Deploy

#### Step 4: Verify

1. Visit Vercel deployment URL
2. Test API calls work (create note, view action items, etc.)

### Option B: Deploy to AWS Lightsail

#### Step 1: Launch Lightsail Instance

1. Go to AWS Lightsail console
2. Create instance:
   - Blueprint: Ubuntu 22.04 LTS
   - Instance plan: $5/month (3 GB RAM)
   - Name: fastapi-app
3. Wait for instance to be running
4. Note the public IP

#### Step 2: Upload Deployment Scripts

```bash
# Copy service files to instance
scp -i your-key.pem deployment/aws/fastapi.service ubuntu@<IP>:/home/ubuntu/
scp -i your-key.pem deployment/aws/nginx.conf ubuntu@<IP>:/home/ubuntu/
```

#### Step 3: Run Setup Script

```bash
ssh -i your-key.pem ubuntu@<IP>
# Run the setup script or manually configure
```

#### Step 4: Build and Deploy Frontend

```bash
cd /home/ubuntu/week5
cd frontend
npm install
npm run build
# Upload dist folder to S3 or copy to Nginx directory
```

#### Step 5: Verify

1. Visit your Lightsail IP or domain
2. Test API calls work

### Rollback

- **Vercel**: Use dashboard to redeploy previous commit
- **Fly.io**: Use `flyctl releases` and `flyctl deploy --image-tag <tag>`
- **AWS Lightsail**: Create snapshot before updates, restore if needed

---

## Implementation Order

### Option A (Vercel + Fly.io)

1. **Phase 1**: Create `requirements.txt` for backend dependencies
2. **Phase 2**: Update CORS in `backend/app/main.py`
3. **Phase 3**: Configure Vite (`vite.config.js`) for build output
4. **Phase 4**: Create `vercel.json` configuration
5. **Phase 5**: Create Fly.io config (`Dockerfile`, `fly.toml`)
6. **Phase 6**: Update `README.md` with deploy guide
7. **Phase 7**: Test deployment

### Option B (AWS Lightsail)

1. **Phase 1**: Create `requirements.txt` for backend dependencies
2. **Phase 2**: Update CORS in `backend/app/main.py` (allow all origins or specific domain)
3. **Phase 3**: Configure Vite (`vite.config.js`) for build output
4. **Phase 4**: Create systemd service file (`deployment/aws/fastapi.service`)
5. **Phase 5**: Create Nginx config (`deployment/aws/nginx.conf`)
6. **Phase 6**: Create setup script (`deployment/aws/setup.sh`)
7. **Phase 7**: Update `README.md` with AWS deployment guide
8. **Phase 8**: Test deployment

---

## Dependencies Required

### Python (requirements.txt)

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-dotenv==1.0.0
```

### Node (frontend/package.json - already present)

- vite
- @vitejs/plugin-react
- react, react-dom
