from uuid import UUID

from fastapi import APIRouter

from app.schemas.booking import BookingCreate
from app.services.booking import create_booking
from app.core.database import supabase

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("")
def create_new_booking(data: BookingCreate):
    return create_booking(
        farmer_id=data.farmer_id,
        centre_id=data.centre_id,
        slot_id=data.slot_id,
        crop_id=data.crop_id,
        estimated_quantity=data.estimated_quantity,
    )


@router.get("/{booking_id}")
def get_booking(booking_id: UUID):
    response = (
        supabase
        .table("bookings")
        .select("*")
        .eq("id", str(booking_id))
        .single()
        .execute()
    )

    return response.data