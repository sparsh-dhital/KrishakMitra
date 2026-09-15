from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AssistantRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    farmer_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = []

class AssistantResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    action_data: Optional[Dict[str, Any]] = None
