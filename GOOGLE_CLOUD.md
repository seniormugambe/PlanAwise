# Google Cloud and Vertex AI Setup

PlanWise can run its AI agents through Vertex AI on Google Cloud. The browser never needs a Vertex key; the backend can use a Vertex AI API key for local testing, Google Cloud Application Default Credentials locally, or the Cloud Run service account in production.

## Local Vertex AI With API Key

Google supports Vertex AI API keys for testing. Use an express mode API key or a service-account-bound Google Cloud API key; a standard unrestricted key might not work.

Configure `backend/.env`:

```env
PORT=5000
AI_PROVIDER=vertex
VERTEX_API_KEY=your_vertex_api_key_here
VERTEX_API_ENDPOINT=https://aiplatform.googleapis.com
GOOGLE_GENAI_USE_VERTEXAI=true
VERTEX_AI_MODEL=gemini-2.5-flash-lite
```

Then start the backend:

```bash
cd backend
npm install
npm run dev
```

## Local Vertex AI With ADC

1. Enable the Vertex AI API in your Google Cloud project.
2. Authenticate locally:
   ```bash
   gcloud auth application-default login
   ```
3. Configure `backend/.env`:
   ```env
   PORT=5000
   AI_PROVIDER=vertex
   GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   VERTEX_AI_MODEL=gemini-2.5-flash-lite
   ```
4. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

If `AI_PROVIDER=auto`, the backend uses Vertex AI when `GOOGLE_CLOUD_PROJECT` is set and falls back to the Gemini API client otherwise.

## Cloud Run Backend

Create an Artifact Registry repository once:

```bash
gcloud artifacts repositories create planwise \
  --repository-format=docker \
  --location=us-central1 \
  --description="PlanWise containers"
```

Deploy the backend with Cloud Build:

```bash
gcloud builds submit \
  --config cloudbuild.backend.yaml \
  --substitutions _REGION=us-central1,_SERVICE_NAME=planwise-ai-backend
```

Grant the Cloud Run runtime service account permission to use Vertex AI:

```bash
gcloud projects add-iam-policy-binding your-google-cloud-project-id \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

After deployment, set the frontend environment variable to the Cloud Run URL:

```env
VITE_API_URL=https://planwise-ai-backend-xxxxx-uc.a.run.app
```

Then rebuild and deploy the frontend wherever you host the static Vite app.

## Useful Checks

Backend provider status:

```bash
curl https://YOUR_BACKEND_URL/api/ai/status
```

Use `?check=1` when you explicitly want a live provider validation call.

Expected status includes:

```json
{
  "connected": false,
  "connectionChecked": false,
  "ai": {
    "provider": "vertex",
    "model": "gemini-2.5-flash-lite"
  }
}
```
