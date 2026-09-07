from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.database import supabase

router = APIRouter(tags=["Status"])


class BookingStatusUpdate(BaseModel):
    status: str


@router.patch("/bookings/{booking_id}/status")
def update_booking_status(booking_id: UUID, data: BookingStatusUpdate):
    response = (
        supabase
        .table("bookings")
        .update({"status": data.status})
        .eq("id", str(booking_id))
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    return response.data[0]


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