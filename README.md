# Communiquer2.0

Communiquer2.0 is a React + Vite frontend with an Express backend that proxies Gemini API calls for speech synthesis, oral-performance analysis, chat, and word decoding.

## Production Target

Recommended platform: **Google Cloud Run**.

Why Cloud Run fits this project:

- The app already uses a persistent Express server.
- The `public/` folder contains large MP3/PDF assets, which are better handled in a container than in a small serverless-function bundle.
- The backend needs a secret `GEMINI_API_KEY`, which Cloud Run can read from Secret Manager.
- The app can later move MP3/PDF files to Cloud Storage or a CDN by setting `VITE_ASSET_BASE_URL` at build time.

## Environment Variables

Required runtime variable:

```bash
GEMINI_API_KEY=your_gemini_api_key
```

Optional build-time variable:

```bash
VITE_ASSET_BASE_URL=https://storage.googleapis.com/your-public-assets-bucket
```

Leave `VITE_ASSET_BASE_URL` empty to serve files from `public/`.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build Locally

```bash
npm run lint
npm run build
npm run start
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## Deploy to Google Cloud Run

1. Install and authenticate the Google Cloud CLI.

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. Enable required services.

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

3. Store the Gemini key in Secret Manager.

```bash
printf "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

If the secret already exists:

```bash
printf "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-
```

4. Deploy from the project root.

```bash
gcloud run deploy communiquer2 \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

Cloud Run will build the Dockerfile, start the Node server on the provided `PORT`, and return a service URL.

## Verify Production

Replace `YOUR_CLOUD_RUN_URL` with the deployed URL.

```bash
curl YOUR_CLOUD_RUN_URL/api/health
```

Expected:

```json
{"status":"ok","environment":"production","geminiConfigured":true}
```

Test TTS:

```bash
curl -X POST YOUR_CLOUD_RUN_URL/api/gemini/tts \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Bonjour\"}"
```

Expected: JSON with a `data` field containing base64 audio. If Gemini TTS is unavailable or restricted, the app returns a graceful fallback error.

Test oral analysis with a real WAV file:

```powershell
$base = "YOUR_CLOUD_RUN_URL"
$audio = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\sample.wav"))
$body = @{ audioBase64 = $audio; modelText = "Bonjour"; prompt = "Analyse cette prononciation et réponds en JSON." } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -ContentType "application/json" -Body $body "$base/api/gemini/analyze"
```

## Large Assets

The repository currently keeps PDFs and MP3s in `public/`. This works immediately.

For a stronger production setup later:

1. Upload the files to Cloud Storage.
2. Make them publicly readable or serve them through a CDN.
3. Build with `VITE_ASSET_BASE_URL` set to that public base URL.
4. Remove the large files from `public/` after verifying the CDN paths.
