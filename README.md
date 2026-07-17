# Media Monitoring Dashboard

React/Vite frontend for the Media Monitoring API. The dashboard displays live
article, sentiment, source, keyword, and data-quality data from the FastAPI
backend.

## Run locally

Start the backend from the workspace root:

```bash
cd BE-Media-Monitoring-Rev
../.venv/bin/uvicorn api:app --reload
```

Then start the frontend in a second terminal:

```bash
cd FE-Media-Monitoring
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

The frontend uses `http://127.0.0.1:8000` by default. To point it to another
backend, create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Production build

```bash
npm run build
```

The generated files are written to `dist/`.
