from fastapi import APIRouter

from app.core.database import supabase

router = APIRouter(prefix="/crops", tags=["Crops"])


@router.get("")
def get_crops():
    response = (
        supabase
        .table("crops")
        .select("*")
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    return response.data
