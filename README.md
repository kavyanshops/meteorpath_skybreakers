# MeteorPath

![MeteorPath Banner](placeholder.png)

**MeteorPath** is a full-stack web application designed for multi-station meteor trajectory reconstruction. It ingests data from global camera networks, triangulates atmospheric paths, and renders them interactively on a 3D Earth globe.

*Current Stage: Phase 0/1 + Skeleton Phase 2 (Initial Progress)*

## Tech Stack

| Layer          | Technology                               |
|----------------|------------------------------------------|
| **Frontend**   | React 18, Vite, TypeScript, Tailwind CSS |
| **3D Globe**   | CesiumJS (via Resium)                    |
| **UI Library** | Radix UI, Framer Motion, Lucide React    |
| **Data Fetch** | TanStack React Query, Axios              |
| **Backend**    | Python 3.11, FastAPI                     |
| **Database**   | PostgreSQL 16, SQLModel, Alembic         |
| **Data Source**| Global Meteor Network (gmn-python-api)   |

## Quick Start (Docker)

Dependencies: Docker and Docker Compose.

1. **Start the infrastructure**
   ```bash
   docker-compose up --build -d
   ```
   *This starts the DB (5432), Backend (8000), and Frontend (5173).*

2. **Seed the database with real GMN data**
   ```bash
   docker-compose exec backend python -m scripts.seed_db
   ```
   *This creates tables and downloads ~90 days of trajectory data from GMN.*

3. **Open the App**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## Running Locally (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: Ensure a local PostgreSQL instance is running and update `.env` accordingly.*
*Seed the DB: `python -m scripts.seed_db`*

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System status and event count |
| GET | `/api/events` | Paginated list of events with filtering |
| GET | `/api/events/{id}` | Detailed event data with trajectory |
| POST| `/api/ingest/gmn` | Trigger GMN data ingestion for date range |

## Data Sources Attribution
- **GMN**: Global Meteor Network open data API via `gmn-python-api`
- **NASA**: NASA Fireball Network (stubbed for future)
- **AMS**: American Meteor Society (stubbed for future)
- **IAU**: International Astronomical Union Meteor Data Center

## Project Structure
```
/meteorpath
├── /backend            # FastAPI server
│   ├── app/            # Source code
│   │   ├── api/        # REST route definitions
│   │   ├── core/       # Business logic (ingestion, trajectory)
│   │   ├── models.py   # SQLModel database schemas
│   │   └── schemas.py  # Pydantic validation schemas
│   └── scripts/        # DB seeding and migrations
├── /frontend           # React SPA
│   ├── public/
│   └── src/
│       ├── api/        # Axios client
│       ├── components/ # Reusable UI pieces
│       ├── hooks/      # React Query hooks
│       ├── pages/      # Route level components
│       └── styles/     # CSS tokens and animations
└── docker-compose.yml  # Container orchestration
```
