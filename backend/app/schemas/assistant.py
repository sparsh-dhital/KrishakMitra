from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    farmer_id: Optional[str] = None
    chat_history: List[Dict[str, str]] = Field(default_factory=list)


class AssistantResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    action_data: Optional[Dict[str, Any]] = None
