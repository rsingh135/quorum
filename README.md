# Quorum

Quorum is an agentic AI financial intelligence terminal that simulates Supreme Court deliberation (one agent per Justice) and maps predicted outcomes to market implications.

## Monorepo structure

```
/quorum
  /frontend   Next.js 14 (App Router) + Tailwind + Framer Motion
  /backend    FastAPI + (later) LangGraph/LangChain
  /shared     Shared TypeScript types
```

## Local development (Phase 1)

### Frontend

```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000`.

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional (Phase 2+ ML/vector deps):

```bash
pip install -r requirements-ml.txt
```

Health check:

```bash
curl http://localhost:8000/api/health
```

## Backend API (Phase 4)

Base URL: `http://localhost:8000/api` (set `NEXT_PUBLIC_API_URL` in the frontend).

| Method | Path | Description |
|--------|------|----------------|
| GET | `/health` | Liveness |
| GET | `/cases` | List seeded cases (summary) |
| GET | `/cases/{docket_id}` | Full case JSON |
| POST | `/cases/search` | Body: `{ "query": "..." }` — CourtListener SCOTUS search |
| POST | `/analysis/run` | Body: `{ "docket_id": "24-983" }` or `{ "case_text": "..." }` → `{ session_id }` |
| GET | `/analysis/stream/{session_id}` | Server-Sent Events: `justice_complete`, `coalition_detected`, `verdict_ready`, `market_mapped`, `complete` |
| GET | `/analysis/{session_id}` | Poll full result when `status` is `complete` |
| GET | `/justices` | Justice metadata (no corpus) |
| POST | `/justices/{justice_id}/query` | Body: `{ "question": "..." }` |
| POST | `/portfolio/scan` | Body: `{ "tickers": ["PFE", "XOM"] }` |

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env.local` as needed.

