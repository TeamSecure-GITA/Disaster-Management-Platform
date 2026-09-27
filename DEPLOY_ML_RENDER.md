# Deploying Disaster Management ML/AI Backend Separately on Render

This guide walks you through deploying the **AI/ML Subsystem** (`ml_backend`) as a standalone web service on [Render](https://render.com).

---

## 🚀 Quick Summary of Configurations

| Parameter | Recommended Value |
|---|---|
| **Runtime** | `Python` (or `Docker`) |
| **Root Directory** | `ml_backend` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1` |
| **Health Check Path** | `/health` |
| **Instance Type** | `Free` (or `Starter`) |

---

## 🛠️ Method 1: Deploying via Render Dashboard (Native Python - Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your repository: `DISASTER_MANAGEMENT_PLATFORM`.
4. Configure the following service settings:
   - **Name**: `disaster-management-ml` (or any name you prefer)
   - **Region**: Select closest to your users (e.g. `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `ml_backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
     ```
5. Click **Advanced** and configure:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: `Yes`
6. Add the following **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `ENVIRONMENT` | `production` | Enables production optimisations |
| `DEBUG` | `false` | Disables debug stack traces in public responses |
| `ML_ENABLED` | `true` | Enables scikit-learn models & inference engines |
| `AI_ENABLED` | `true` | Enables AI copilot and disaster intelligence |
| `PREDICTION_ENABLED` | `true` | Enables multi-hazard prediction endpoints |
| `WEBSOCKET_ENABLED` | `true` | Enables live telemetry/simulation websockets |
| `CORS_ORIGINS` | `*` | Or specify comma-separated list of your frontend/backend URLs |
| `CORS_ALLOW_CREDENTIALS` | `false` | Set to `false` when using wildcard CORS `*` |
| `GEMINI_API_KEY` | *(your Gemini key)* | Optional: Enables live Google Gemini LLM copilot |

7. Click **Create Web Service**.
8. Render will build and deploy your ML service. Once deployed, note down the URL (e.g. `https://disaster-management-ml.onrender.com`).

---

## 🐳 Method 2: Deploying via Docker on Render

If you prefer containerized deployment:

1. In Render, select **New +** -> **Web Service**.
2. Connect your repository.
3. Configure:
   - **Root Directory**: `ml_backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (inside `ml_backend`)
4. In **Advanced**, set **Health Check Path** to `/health`.
5. Add the environment variables listed in Method 1.
6. Click **Create Web Service**. Render will automatically build the container and bind to `$PORT`.

---

## 📋 Method 3: Deploying via Render Blueprint (`render.yaml`)

Both the repository root and `ml_backend/` directory contain `render.yaml` blueprint manifests.

### To deploy ONLY the ML backend from Blueprint:
1. In Render Dashboard, click **Blueprints** -> **New Blueprint Instance**.
2. Connect the repository.
3. If deploying via the repository `render.yaml`, Render will display the services defined in `render.yaml`. You can uncheck other services and only deploy `Disaster-Management-Platform-ML`.
4. Click **Apply**.

---

## 🔗 Connecting the ML Service to Node.js Backend & Frontend

Once your ML backend is live on Render at `https://disaster-management-ml.onrender.com`:

### 1. In your Node.js Backend:
Add this environment variable to your Backend Render Web Service or `.env`:
```env
AI_CHATBOT_URL=https://disaster-management-ml.onrender.com
```
The Backend (`controllers/aiController.js` and `app.js`) will automatically proxy all `/api/ai/*`, `/chat`, and `/predict` calls to your separate Render ML backend.

### 2. In your Frontend (Vite / React):
If direct ML calls from the frontend are desired:
```env
VITE_AI_API_URL=https://disaster-management-ml.onrender.com
```

---

## ✅ Verifying Your Deployed ML Service

Once deployed, test these endpoints in your browser or with `curl`:

### 1. Health Check
```bash
curl https://your-ml-service.onrender.com/health
```
**Expected Response:**
```json
{"status":"healthy","service":"Disaster Management Platform","version":"1.0.0","environment":"production"}
```

### 2. Interactive Swagger API Documentation
Visit:
```
https://your-ml-service.onrender.com/docs
```

### 3. Hazard Prediction Test
```bash
curl -X POST https://your-ml-service.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"disaster_type":"landslide","rainfall_24h_mm":85,"slope_angle_deg":35,"soil_moisture_pct":68}'
```

### 4. AI Copilot Chat Test
```bash
curl -X POST https://your-ml-service.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What emergency protocols apply to flash floods?"}'
```
