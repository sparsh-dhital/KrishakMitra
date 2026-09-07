from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.core.database import supabase

router = APIRouter(prefix="/queue", tags=["Queue"])


@router.get("/token/{token_id}")
def get_queue_entry(token_id: UUID):
    response = (
        supabase
        .table("queue_entries")
        .select("*")
        .eq("token_id", str(token_id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Queue entry not found",
        )

    return response.data