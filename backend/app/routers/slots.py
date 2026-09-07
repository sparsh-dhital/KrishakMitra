from uuid import UUID

from fastapi import APIRouter, Query

from app.core.database import supabase

router = APIRouter(prefix="/slots", tags=["Slots"])


@router.get("")
def get_slots(
    centre_id: UUID | None = Query(default=None),
    date: str | None = Query(default=None),
):
    query = supabase.table("slots").select("*")

    if centre_id:
        query = query.eq("centre_id", str(centre_id))

    if date:
        query = query.eq("date", date)

    return query.execute().data