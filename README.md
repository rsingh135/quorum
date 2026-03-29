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

Health check:

```bash
curl http://localhost:8000/api/health
```

