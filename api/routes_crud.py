# api/routes_crud.py
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from api.db import engine, Sleep, Diet, Menstrual, Symptoms
from pydantic import BaseModel

router = APIRouter()

# --- Sleep CRUD ---
class InsertSleep(BaseModel):
    date:    datetime
    duration: float
    quality:  int
    disruptions: str
    notes:      str

@router.post("/insert_sleep")
def insert_sleep(payload: InsertSleep):
    with Session(engine) as session:
        record = Sleep(**payload.dict())
        session.add(record)
        session.commit()
        session.refresh(record)
        return record  # returns the full Sleep ORM instance

@router.get("/get_all_sleep")
def get_all_sleep():
    with Session(engine) as session:
        records = session.exec(select(Sleep).order_by(Sleep.date.desc())).all()
        return records

# --- Diet CRUD ---
class InsertDiet(BaseModel):
    meal: str
    date: datetime
    items: list[str]
    notes: str

@router.post("/insert_diet")
def insert_diet(payload: InsertDiet):
    items_csv = ",".join(payload.items)
    record = Diet(
        meal=payload.meal,
        date=payload.date,
        items=items_csv,
        notes=payload.notes
    )
    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)
        return record

@router.get("/get_all_diet")
def get_all_diet():
    with Session(engine) as session:
        rows = session.exec(select(Diet).order_by(Diet.date.desc())).all()
        for r in rows:
            # Convert CSV → array
            r.items = r.items.split(",") if isinstance(r.items, str) else []
        return rows

# --- Menstrual CRUD ---
class InsertMenstrual(BaseModel):
    period_event: str
    date: datetime
    flow_level: str | None
    notes: str

@router.post("/insert_menstrual")
def insert_menstrual(payload: InsertMenstrual):
    record = Menstrual(**payload.dict())
    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)
        return record

@router.get("/get_all_menstrual")
def get_all_menstrual():
    with Session(engine) as session:
        return session.exec(select(Menstrual).order_by(Menstrual.date.desc())).all()

# --- Symptoms CRUD ---
class InsertSymptoms(BaseModel):
    date: datetime
    nausea:  int
    fatigue: int
    pain:    int
    notes:   str

@router.post("/insert_symptoms")
def insert_symptoms(payload: InsertSymptoms):
    record = Symptoms(**payload.dict())
    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)
        return record

@router.get("/get_all_symptoms")
def get_all_symptoms():
    with Session(engine) as session:
        return session.exec(select(Symptoms).order_by(Symptoms.date.desc())).all()
