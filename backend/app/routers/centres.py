from fastapi import APIRouter

from app.core.database import supabase

router = APIRouter(prefix="/centres", tags=["Centres"])


@router.get("")
def get_centres():
    response = (
        supabase
        .table("centres")
        .select("*")
        .eq("is_active", True)
        .execute()
    )

    return response.data