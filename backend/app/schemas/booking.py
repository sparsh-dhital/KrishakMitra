from uuid import UUID

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    farmer_id: UUID
    centre_id: UUID
    slot_id: UUID
    crop_id: UUID
    estimated_quantity: float = Field(gt=0)