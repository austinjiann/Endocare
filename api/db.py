# api/db.py
from datetime import datetime
from sqlmodel import SQLModel, Field, create_engine, Session

# This will live in the project root, next to your "api/" folder
DATABASE_URL = "sqlite:///./endoease.db"

# echo=True will print SQL to the console so you can see the tables being created
engine = create_engine(DATABASE_URL, echo=True)

# --- table definitions ---
class Sleep(SQLModel, table=True):
    id:          int      = Field(default=None, primary_key=True)
    date:        datetime
    duration:    float
    quality:     int
    disruptions: str
    notes:       str
    created_at:  datetime = Field(default_factory=datetime.utcnow)

class Diet(SQLModel, table=True):
    id:         int      = Field(default=None, primary_key=True)
    meal:       str
    date:       datetime
    items:      str      # we’ll store comma-separated; parse in code
    notes:      str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Menstrual(SQLModel, table=True):
    id:           int      = Field(default=None, primary_key=True)
    period_event: str
    date:         datetime
    flow_level:   str | None
    notes:        str
    created_at:   datetime = Field(default_factory=datetime.utcnow)

class Symptoms(SQLModel, table=True):
    id:      int      = Field(default=None, primary_key=True)
    date:    datetime
    nausea:  int
    fatigue: int
    pain:    int
    notes:   str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Prediction(SQLModel, table=True):
    id:          int      = Field(default=None, primary_key=True)
    date:        datetime
    cycle_day:   int
    probability: float
    created_at:  datetime = Field(default_factory=datetime.utcnow)

# call this at startup to create the file + tables
def init_db():
    SQLModel.metadata.create_all(engine)
