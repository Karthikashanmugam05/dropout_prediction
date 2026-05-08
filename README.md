# Student Dropout Prediction & Early Warning System

Production-style full stack web application for institution-level student risk monitoring.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS + Recharts
- **Backend:** FastAPI + SQLAlchemy + Pydantic
- **Database:** PostgreSQL
- **Machine Learning:** scikit-learn (Random Forest + KMeans)

## Project Structure

```text
backend/
  app/
    api/routes.py
    core/config.py
    db/database.py
    db/models.py
    schemas/student_schema.py
    services/ml_service.py
    main.py
frontend/
```

## Backend Setup

1. Create environment file:
   - Copy `backend/.env.example` to `backend/.env`
2. Start PostgreSQL:
   - `docker compose up -d`
3. Install dependencies:
   - `cd backend`
   - `pip install -r requirements.txt`
4. Run API:
   - `uvicorn app.main:app --reload`

API base URL: `http://localhost:8000`

## Frontend Setup

1. Create environment file:
   - Copy `frontend/.env.example` to `frontend/.env`
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Run frontend:
   - `npm run dev`

Frontend URL: `http://localhost:5173`

## Core Features Implemented

- Student data management (create, list, detail, update endpoint)
- Dropout prediction endpoint with:
  - Probability score (0-100%)
  - Risk category (Low/Medium/High)
  - Top contributing factors
  - Feature importance map
- Dashboard analytics endpoint:
  - Total students
  - At-risk count
  - Risk distribution
  - Prediction trend
  - Recent predictions list
- SaaS-style dashboard UI:
  - Sidebar navigation
  - KPI cards
  - Pie/Line/Bar charts
  - Student detail profile and performance timeline

## API Endpoints

- `POST /students/`
- `GET /students/`
- `GET /students/{id}`
- `PUT /students/{id}`
- `POST /predict/{student_id}`
- `GET /dashboard/stats`

## ML Pipeline

1. Preprocessing:
   - Missing value handling (`SimpleImputer`)
   - Categorical encoding (`OneHotEncoder`)
   - Numerical scaling (`StandardScaler`)
2. Feature engineering:
   - Attendance, marks, assignments, library usage, fee delay, engagement, department
3. KMeans clustering:
   - Supports Low/Medium/High risk grouping
4. Random Forest classification:
   - Produces dropout probability
5. Explainability output:
   - Feature importance
   - Human-readable reason summary

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

Copyright (c) 2026 Karthikas Ahnmugam.
