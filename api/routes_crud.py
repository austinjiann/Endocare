# api/routes_crud.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.supabase_client import supabase

router = APIRouter()

# --- Sleep CRUD ---
class InsertSleep(BaseModel):
    date: str          # ISO 8601 datetime
    duration: float    # hours
    quality: int       # 0-10 scale
    disruptions: str   # e.g., "2 awakenings"
    notes: str

@router.post("/insert_sleep")
async def insert_sleep(payload: InsertSleep):
    try:
        supabase.table("sleep").insert(payload.model_dump()).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_all_sleep")
async def get_all_sleep():
    try:
        data = supabase.table("sleep").select("*").execute().data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Diet CRUD ---
class InsertDiet(BaseModel):
    meal: str         # breakfast, lunch, dinner, etc.
    date: str         # ISO 8601 datetime
    items: list[str]  # list of food items
    notes: str

@router.post("/insert_diet")
async def insert_diet(payload: InsertDiet):
    try:
        supabase.table("diet").insert(payload.model_dump()).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_all_diet")
async def get_all_diet():
    try:
        data = supabase.table("diet").select("*").execute().data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Menstrual CRUD ---
class InsertMenstrual(BaseModel):
    period_event: str  # "start" or "end"
    date: str          # ISO 8601 datetime
    flow_level: str    # low, moderate, heavy
    notes: str

@router.post("/insert_menstrual")
async def insert_menstrual(payload: InsertMenstrual):
    try:
        supabase.table("menstrual").insert(payload.model_dump()).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_all_menstrual")
async def get_all_menstrual():
    try:
        data = supabase.table("menstrual").select("*").execute().data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Symptoms CRUD ---
class InsertSymptoms(BaseModel):
    date: str     # ISO 8601 datetime
    nausea: int   # 0-10 scale
    fatigue: int  # 0-10 scale
    pain: int     # 0-10 scale
    notes: str

@router.post("/insert_symptoms")
async def insert_symptoms(payload: InsertSymptoms):
    try:
        supabase.table("symptoms").insert(payload.model_dump()).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_all_symptoms")
async def get_all_symptoms():
    try:
        data = supabase.table("symptoms").select("*").execute().data
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
