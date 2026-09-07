from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.core.database import supabase

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.get("/{farmer_id}")
def get_farmer(farmer_id: UUID):
    response = (
        supabase
        .table("farmers")
        .select("*")
        .eq("id", str(farmer_id))
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return response.data[0]
