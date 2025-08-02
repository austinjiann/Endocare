# api/routes_crud.py  (NEW)
from fastapi import APIRouter
from pydantic import BaseModel
from supabase_client import supabase

router = APIRouter()

class InsertSleep(BaseModel):
    date: str; duration: float; quality: int
    disruptions: str; notes: str

@router.post("/insert_sleep")
def insert_sleep(req: InsertSleep):
    supabase.table("sleep").insert(req.model_dump()).execute()
    return {"status": "ok"}

@router.get("/get_all_sleep")
def get_all_sleep():
    data = supabase.table("sleep").select("*").execute().data
    return data