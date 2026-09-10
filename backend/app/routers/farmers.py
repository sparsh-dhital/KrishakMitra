from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.database import supabase

router = APIRouter(prefix="/farmers", tags=["Farmers"])


class FarmerProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=10, max_length=20)
    village: str = Field(min_length=2, max_length=120)
    aadhaar_ref: str = Field(min_length=4, max_length=120)
    land_details: dict = Field(default_factory=dict)


class KycReview(BaseModel):
    status: str
    note: str = ""


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


@router.get("")
def list_farmers():
    response = supabase.table("farmers").select("*").order("created_at", desc=True).execute()
    return response.data or []


@router.patch("/{farmer_id}")
def update_farmer(farmer_id: UUID, payload: FarmerProfileUpdate):
    response = (
        supabase.table("farmers")
        .update({**payload.model_dump(), "kyc_status": "pending", "kyc_note": ""})
        .eq("id", str(farmer_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return response.data[0]


@router.patch("/{farmer_id}/kyc")
def review_kyc(farmer_id: UUID, payload: KycReview):
    if payload.status not in {"pending", "approved", "changes_requested", "denied"}:
        raise HTTPException(status_code=400, detail="Invalid KYC status")
    response = (
        supabase.table("farmers")
        .update({"kyc_status": payload.status, "kyc_note": payload.note})
        .eq("id", str(farmer_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return response.data[0]
