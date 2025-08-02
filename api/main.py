# api/main.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np, joblib

# ---------- NEW JSON CONTRACT ----------
class Features(BaseModel):
    date: str                # ISO date "YYYY-MM-DD"
    duration_h: float        # 6.8
    quality_pct: float       # 72
    cycle_day: int           # 1–30
    pain_today: int          # 0–10
    processed_sugar: int     # 0/1
    caffeine_evening: int    # 0/1

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

@app.post("/predict-flare")
def predict(f: Features):
    X = np.array([[
        f.duration_h, f.quality_pct,
        f.cycle_day, f.processed_sugar,
        f.caffeine_evening, f.pain_today
    ]])
    prob = float(model.predict_proba(X)[0, 1])
    return {"flareProbability": round(prob, 3)}
