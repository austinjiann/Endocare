# api/main.py

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib

# ——— Supabase client ———
from api.supabase_client import supabase

# ——— CRUD routes ———
from api.routes_crud import router as crud_router

# ——— JSON schema for ML endpoint ———
class Features(BaseModel):
    date: str              # "2025-08-02"
    duration_h: float
    quality_pct: float
    cycle_day: int
    pain_today: int
    processed_sugar: int   # 0/1
    caffeine_evening: int  # 0/1

# ——— App setup ———
app = FastAPI()

# allow Expo / browser to hit all endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount Aaron’s CRUD endpoints
app.include_router(crud_router)

# health‐check
@app.get("/")
def root():
    return {"status": "EndoEase API live"}

# ——— Load the cycle-aware flare model ———
MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "flare_cycle_xgb.pkl"
model = joblib.load(MODEL_PATH)

# ——— ML endpoint ———
@app.post("/predict-flare")
def predict(f: Features):
    X = np.array([[
        f.duration_h,
        f.quality_pct,
        f.cycle_day,
        f.processed_sugar,
        f.caffeine_evening,
        f.pain_today
    ]])

    prob = float(model.predict_proba(X)[0, 1])

    # write back to Supabase predictions table
    supabase.table("predictions").insert({
        "date": f.date,
        "cycle_day": f.cycle_day,
        "probability": prob,
        "user_id": 1   # replace with real auth when ready
    }).execute()

    return {"flareProbability": round(prob, 3)}
