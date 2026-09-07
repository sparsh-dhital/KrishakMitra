from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import supabase
from app.routers.bookings import router as bookings_router
from app.routers.centres import router as centres_router
from app.routers.crops import router as crops_router
from app.routers.queue import router as queue_router
from app.routers.slots import router as slots_router
from app.routers.status import router as status_router


app = FastAPI(title="Smart Mandi API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(centres_router)
app.include_router(crops_router)
app.include_router(slots_router)
app.include_router(bookings_router)
app.include_router(queue_router)
app.include_router(status_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-health")
def db_health():
    try:
        supabase.table("centres").select("id").limit(1).execute()

        return {
            "status": "ok",
            "database": "connected",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {e}",
        )