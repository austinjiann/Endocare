from pathlib import Path
REPO_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = REPO_ROOT / 'models' / 'flare_xgb.pkl'
model = joblib.load(MODEL_PATH)


from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np, pathlib

model = joblib.load(pathlib.Path(__file__).resolve().parents[1] / 'models' / 'flare_xgb.pkl')
app = FastAPI()

class Features(BaseModel):
    duration_h: float
    quality_pct: float

@app.post("/predict-flare")
def predict(f: Features):
    X = np.array([[f.duration_h, f.quality_pct]])
    prob = float(model.predict_proba(X)[0,1])
    return {"flareProbability": round(prob, 3)}
