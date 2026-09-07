from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.core.database import supabase

router = APIRouter(tags=["Status"])


@router.get("/procurement/{booking_id}")
def get_procurement_status(booking_id: UUID):
    response = (
        supabase
        .table("procurement_records")
        .select("*")
        .eq("booking_id", str(booking_id))
        .execute()
    )

    return response.data


@router.get("/payment/{procurement_id}")
def get_payment_status(procurement_id: UUID):
    response = (
        supabase
        .table("payments")
        .select("*")
        .eq("procurement_id", str(procurement_id))
        .execute()
    )

    return response.data