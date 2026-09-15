import os
import json

from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
client = genai.Client(api_key=API_KEY) if API_KEY else None


def navigate_app(page_name: str) -> dict:
    return {"action": "NAVIGATE", "target": page_name}


def verify_kyc(farmer_id: str) -> dict:
    return {"action": "VERIFY_KYC", "farmer_id": farmer_id}


def book_slot(centre_id: str, crop_name: str) -> dict:
    return {"action": "BOOK_SLOT", "centre_id": centre_id, "crop_name": crop_name}


def get_mandi_prices(crop_name: str) -> dict:
    return {"action": "GET_PRICES", "crop_name": crop_name}


def create_auction(crop_name: str, quantity: float, starting_price: float) -> dict:
    return {
        "action": "CREATE_AUCTION",
        "crop_name": crop_name,
        "quantity": quantity,
        "starting_price": starting_price,
    }


assistant_tools = [
    {
        "type": "function",
        "name": "navigate_app",
        "description": "Navigate the user to a page in the KrishakMitra app.",
        "parameters": {
            "type": "object",
            "properties": {
                "page_name": {
                    "type": "string",
                    "enum": ["home", "booking", "contact", "auction", "prices"],
                }
            },
            "required": ["page_name"],
        },
    },
    {
        "type": "function",
        "name": "verify_kyc",
        "description": "Start KYC verification for a farmer.",
        "parameters": {
            "type": "object",
            "properties": {"farmer_id": {"type": "string"}},
            "required": ["farmer_id"],
        },
    },
    {
        "type": "function",
        "name": "book_slot",
        "description": "Book a mandi slot for a crop.",
        "parameters": {
            "type": "object",
            "properties": {
                "centre_id": {"type": "string"},
                "crop_name": {"type": "string"},
            },
            "required": ["centre_id", "crop_name"],
        },
    },
    {
        "type": "function",
        "name": "get_mandi_prices",
        "description": "Get current mandi prices for a crop.",
        "parameters": {
            "type": "object",
            "properties": {"crop_name": {"type": "string"}},
            "required": ["crop_name"],
        },
    },
    {
        "type": "function",
        "name": "create_auction",
        "description": "Create an auction listing for a crop.",
        "parameters": {
            "type": "object",
            "properties": {
                "crop_name": {"type": "string"},
                "quantity": {"type": "number"},
                "starting_price": {"type": "number"},
            },
            "required": ["crop_name", "quantity", "starting_price"],
        },
    },
]

SYSTEM_INSTRUCTION = (
    "You are KrishakMitra AI, a helpful farming assistant bot for farmers. "
    "You can help them book slots, verify KYC, start auctions, check crop prices, "
    "and navigate the app. Always respond politely in the language the user speaks "
    "to you (e.g. Hindi, Marathi, English). If they ask to do something you have a "
    "tool for, call that tool. Otherwise, explain how you can help."
)


def get_chat_response(message: str, language: str = "en", history: list = None) -> dict:
    if client is None:
        return {
            "reply": "Sorry, my AI capabilities are currently not configured (API key missing).",
            "action": None,
            "action_data": None,
        }

    try:
        history_text = []
        for item in history or []:
            text = item.get("text", "").strip()
            if not text:
                continue
            role = "Assistant" if item.get("sender") in {"ai", "assistant", "model"} else "User"
            history_text.append(f"{role}: {text}")

        prompt = "\n".join(history_text + [f"User (preferred language code: {language}): {message}"])
        interaction = client.interactions.create(
            model=MODEL_NAME,
            system_instruction=SYSTEM_INSTRUCTION,
            input=prompt,
            tools=assistant_tools,
        )

        function_calls = [step for step in interaction.steps if step.type == "function_call"]
        action_name = function_calls[0].name if function_calls else None
        action_data = function_calls[0].arguments if function_calls else None

        if function_calls:
            function_results = [
                {
                    "type": "function_result",
                    "name": step.name,
                    "call_id": step.id,
                    "result": [
                        {
                            "type": "text",
                            "text": json.dumps({"result": f"Executed {step.name} successfully."}),
                        }
                    ],
                }
                for step in function_calls
            ]
            interaction = client.interactions.create(
                model=MODEL_NAME,
                system_instruction=SYSTEM_INSTRUCTION,
                input=function_results,
                tools=assistant_tools,
                previous_interaction_id=interaction.id,
            )

        return {
            "reply": interaction.output_text,
            "action": action_name,
            "action_data": action_data,
        }
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {
            "reply": f"Sorry, I encountered an error: {str(e)}",
            "action": None,
            "action_data": None,
        }
