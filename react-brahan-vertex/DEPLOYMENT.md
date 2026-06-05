# Brahan Vertex Engine - Deployment Guide

## 🎯 Quick Deploy to Google Cloud Run

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed ([Installation Guide](https://cloud.google.com/sdk/docs/install))
- Project ID: `portfolio-project-481815` (or your custom project)

---

## 🚀 Option 1: One-Command Deployment (Recommended)

```bash
cd react-brahan-vertex
./deploy.sh
```

This automated script will:
1. ✅ Enable required GCP APIs
2. 🏗️ Build the Docker container
3. 🚢 Deploy to Cloud Run
4. 🌐 Output your live URL

**Expected Output:**
```
✅ Deployment successful!
🌐 Your app is live at:
https://brahan-vertex-xxxxx-uc.a.run.app
```

---

## 🛠️ Option 2: Manual Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
cd react-brahan-vertex
npm install
```

### Step 2: Test Locally (Optional)

```bash
npm start
```

Visit `http://localhost:3000` to verify the app works.

**Expected Features:**
- ✅ Splash screen with "Initiate Sequence" button
- ✅ Physics Mode toggle in dashboard
- ✅ Voice command interface (PTT button bottom-right)
- ✅ 3D wellbore visualization with React Three Fiber
- ✅ Training redirect when safety violations occur

### Step 3: Build Production Bundle

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Step 4: Build Docker Image

```bash
gcloud builds submit --tag gcr.io/portfolio-project-481815/brahan-vertex
```

**What this does:**
- Builds a multi-stage Docker image
- Stage 1: Compiles React app with Node.js
- Stage 2: Serves static files with Nginx
- Pushes to Google Container Registry

### Step 5: Deploy to Cloud Run

```bash
gcloud run deploy brahan-vertex \
  --image gcr.io/portfolio-project-481815/brahan-vertex \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

**Flags Explained:**
- `--allow-unauthenticated`: Public access (for portfolio)
- `--port 8080`: Cloud Run requirement
- `--memory 512Mi`: Sufficient for React SPA
- `--cpu 1`: Single vCPU for cost efficiency

---

## 🔧 Configuration Options

### Environment Variables (Optional)

Create a `.env.production` file:

```bash
REACT_APP_GCP_PROJECT_ID=portfolio-project-481815
REACT_APP_API_ENDPOINT=https://api.welltegra.network
```

### Custom Domain Setup

1. Go to Cloud Run console
2. Select `brahan-vertex` service
3. Click **"Manage Custom Domains"**
4. Add `brahan-vertex.welltegra.network`
5. Update DNS records as instructed

---

## 📊 Performance Verification

After deployment, verify these metrics:

### End-to-End Latency
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://brahan-vertex-xxxxx-uc.a.run.app
```

**Expected:** <500ms

### Cold Start Performance
```bash
# Wait 15 minutes for scale-to-zero, then:
time curl https://brahan-vertex-xxxxx-uc.a.run.app
```

**Expected:** <2 seconds

### Lighthouse Performance Score
```bash
npx lighthouse https://brahan-vertex-xxxxx-uc.a.run.app --view
```

**Target:** Performance >90

---

## 🎯 Feature Verification Checklist

After deployment, test these portfolio features:

### 1. Physics-Informed ML Toggle
- [ ] Navigate to **Executive** tab
- [ ] Toggle **Physics Mode ON**
- [ ] Verify **Node-02 (Asset Bravo)** integrity drops from 12 → 0
- [ ] Confirm alert appears: *"PHYSICS OVERRIDE: Critical Anomaly Detected"*

### 2. Closed-Loop Training Redirect
- [ ] Go to **Execution** tab
- [ ] Attempt to click **"Confirm Operational Phase"** with Physics Mode ON
- [ ] Verify automatic redirect to **Competency** tab
- [ ] Check banner: *"System Trigger: Procedural Violation Detected"*

### 3. Voice Command Interface
- [ ] Locate **PTT button** (bottom-right corner)
- [ ] Click and hold, say: *"Physics Mode On"*
- [ ] Release and verify command executes
- [ ] Test other commands: *"Emergency Stop"*, *"Open Dashboard"*

### 4. 3D Wellbore Visualization
- [ ] Verify **3D cylinder** renders in wellbore panel
- [ ] Select wells with different integrity scores
- [ ] Confirm cylinder color changes:
  - Green: Integrity >80
  - Yellow: Integrity 20-80
  - Red: Integrity <20

---

## 🔄 CI/CD Automation (Optional)

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'react-brahan-vertex/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: portfolio-project-481815
      - name: Deploy
        run: |
          cd react-brahan-vertex
          gcloud builds submit --config cloudbuild.yaml
```

---

## 💰 Cost Estimation

### Cloud Run Pricing (us-central1)
- **Requests:** First 2M/month free
- **CPU:** $0.00002400/vCPU-second (after free tier)
- **Memory:** $0.00000250/GiB-second (after free tier)

### Expected Monthly Cost (Portfolio Demo)
- **Estimated Traffic:** ~500 requests/month
- **Container Instances:** Scale-to-zero when idle
- **Total Cost:** **$0-5/month** (within free tier)

---

## 🐛 Troubleshooting

### Build Fails: "COPY failed: no source files were specified"

**Solution:** Ensure `package-lock.json` exists:
```bash
npm install  # Generates package-lock.json
```

### Deployment Error: "Image not found"

**Solution:** Rebuild and push image:
```bash
gcloud builds submit --tag gcr.io/portfolio-project-481815/brahan-vertex
```

### App Shows Blank Page

**Solution:** Check nginx configuration:
```bash
# View logs
gcloud run services logs read brahan-vertex --region us-central1

# Verify port 8080
docker run -p 8080:8080 gcr.io/portfolio-project-481815/brahan-vertex
```

### Voice Commands Not Working

**Solution:** Requires HTTPS (Cloud Run provides this automatically). Test in deployed environment, not localhost.

---

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Terraform GCP Module](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service) (for IaC)

---

## ✅ Post-Deployment

### Update Portfolio Links

1. **index.html** - Update Brahan Vertex demo link:
   ```html
   <a href="https://brahan-vertex-xxxxx-uc.a.run.app">🚀 Launch Live Demo</a>
   ```

2. **brahan-vertex-builds.html** - Add deployment URL

3. **LinkedIn Profile** - Update Featured Section:
   ```
   Brahan Vertex Engine (Live Demo)
   https://brahan-vertex-xxxxx-uc.a.run.app
   ```

### Capture Screenshots for LinkedIn

Take screenshots of:
1. **Physics Mode Active** - Node-02 at 0% integrity
2. **Training Redirect Banner** - "Procedural Violation Detected"
3. **Voice Interface Active** - PTT button with transcript
4. **3D Wellbore Rendering** - React Three Fiber visualization

These images will support LinkedIn posts about your cloud architecture and industrial UX design.

---

**🎉 Congratulations!** Your production-ready React app is now live on Google Cloud Platform.
