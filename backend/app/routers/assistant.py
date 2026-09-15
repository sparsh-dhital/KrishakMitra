from fastapi import APIRouter, HTTPException

from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.gemini_service import get_chat_response

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post("/chat", response_model=AssistantResponse)
def chat_with_assistant(req: AssistantRequest):
    try:
        result = get_chat_response(
            message=req.message,
            language=req.language,
            history=req.chat_history,
        )
        return AssistantResponse(
            reply=result["reply"],
            action=result["action"],
            action_data=result["action_data"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
