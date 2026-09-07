from uuid import UUID, uuid4

from fastapi import HTTPException

from app.core.database import supabase


def create_booking(
    farmer_id: UUID,
    centre_id: UUID,
    slot_id: UUID,
    crop_id: UUID,
    estimated_quantity: float,
):
    slot = (
        supabase
        .table("slots")
        .select("*")
        .eq("id", str(slot_id))
        .eq("centre_id", str(centre_id))
        .single()
        .execute()
        .data
    )

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    available = float(slot["capacity_quintals"]) - float(
        slot["booked_quintals"] or 0
    )

    if estimated_quantity > available:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available} quintals are available in this slot",
        )

    booking = (
        supabase
        .table("bookings")
        .insert(
            {
                "farmer_id": str(farmer_id),
                "centre_id": str(centre_id),
                "slot_id": str(slot_id),
                "crop_id": str(crop_id),
                "estimated_quantity": estimated_quantity,
            }
        )
        .execute()
        .data
    )

    if not booking:
        raise HTTPException(
            status_code=500,
            detail="Booking could not be created",
        )

    booking = booking[0]

    token_number = f"SM-{uuid4().hex[:8].upper()}"

    token = (
        supabase
        .table("tokens")
        .insert(
            {
                "booking_id": booking["id"],
                "token_number": token_number,
            }
        )
        .execute()
        .data
    )

    return {
        "booking": booking,
        "token": token[0] if token else None,
    }