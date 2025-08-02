# api/main.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np, joblib
from api.routes_crud import router as crud_router

app = FastAPI()
app.include_router(crud_router)
# ---------- NEW JSON CONTRACT ----------
class Features(BaseModel):
    date: str              # "2025-08-02"
    duration_h: float
    quality_pct: float
    cycle_day: int
    pain_today: int
    processed_sugar: int   # 0/1
    caffeine_evening: int  # 0/1


# ---------- load model ----------
MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "flare_cycle_xgb.pkl"
model = joblib.load(MODEL_PATH)

app = FastAPI()
# allow Expo app to hit localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.get("/")
def root():
    return {"status": "EndoEase API live"}
from supabase_client import supabase

@app.post("/predict-flare")
def predict(f: Features):
    X = np.array([[f.duration_h, f.quality_pct,
                   f.cycle_day, f.processed_sugar,
                   f.caffeine_evening, f.pain_today]])
    prob = float(model.predict_proba(X)[0, 1])

    # store
    supabase.table("predictions").insert({
        "date": f.date,
        "probability": prob,
        "cycle_day": f.cycle_day,
        "user_id": 1             # swap when auth arrives
    }).execute()

    return {"flareProbability": round(prob, 3)}
