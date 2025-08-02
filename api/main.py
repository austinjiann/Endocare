# api/main.py

from api.db import init_db
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
from sqlmodel import Session

# --- SQLite DB setup ---
from api.db import engine, init_db, Prediction

# --- CRUD router (Sleep, Diet, Menstrual, Symptoms) ---
from api.routes_crud import router as crud_router

# --- Input schema for ML endpoint ---
class Features(BaseModel):
    date: str              # "2025-08-02"
    duration_h: float
    quality_pct: float
    cycle_day: int
    pain_today: int
    processed_sugar: int   # 0/1
    caffeine_evening: int  # 0/1

# --- FastAPI app setup ---
app = FastAPI(title="EndoEase API")

# Initialize SQLite tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Allow any origin (for Expo development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount CRUD routes
app.include_router(crud_router)

# Health check
@app.get("/")
def root():
    return {"status": "EndoEase API live"}

# --- Load the ML model ---
MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "flare_cycle_xgb.pkl"
model = joblib.load(MODEL_PATH)

# --- ML endpoint: predict next-day flare probability ---
@app.post("/predict-flare")
def predict(f: Features):
    # Build feature array
    X = np.array([[
        f.duration_h,
        f.quality_pct,
        f.cycle_day,
        f.processed_sugar,
        f.caffeine_evening,
        f.pain_today
    ]])

    # Model inference
    prob = float(model.predict_proba(X)[0, 1])

    # Persist prediction to SQLite
    rec = Prediction(
        date=f.date,
        cycle_day=f.cycle_day,
        probability=prob
    )
    with Session(engine) as session:
        session.add(rec)
        session.commit()

    return {"flareProbability": round(prob, 3)}