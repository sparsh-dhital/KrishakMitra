import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Define tools for the model
def navigate_app(page_name: str) -> dict:
    """
    Navigates the user to a different page within the app.

    Args:
        page_name: The destination page. Possible values: 'home', 'booking', 'contact', 'auction', 'prices'.
    """
    return {"action": "NAVIGATE", "target": page_name}

def verify_kyc(farmer_id: str) -> dict:
    """
    Initiates the KYC verification process for a farmer.

    Args:
        farmer_id: The ID of the farmer to verify.
    """
    return {"action": "VERIFY_KYC", "farmer_id": farmer_id}

def book_slot(centre_id: str, crop_name: str) -> dict:
    """
    Books a slot for the farmer at a given centre for a given crop.

    Args:
        centre_id: The ID of the Mandi centre.
        crop_name: The name of the crop.
    """
    return {"action": "BOOK_SLOT", "centre_id": centre_id, "crop_name": crop_name}

def get_mandi_prices(crop_name: str) -> dict:
    """
    Retrieves the current market prices for a specific crop.

    Args:
        crop_name: The name of the crop (e.g. 'Wheat', 'Rice').
    """
    return {"action": "GET_PRICES", "crop_name": crop_name}

def create_auction(crop_name: str, quantity: float, starting_price: float) -> dict:
    """
    Puts up a crop for auction.

    Args:
        crop_name: The name of the crop to auction.
        quantity: The amount in quintals.
        starting_price: The base price per quintal.
    """
    return {"action": "CREATE_AUCTION", "crop_name": crop_name, "quantity": quantity, "starting_price": starting_price}


# List of tools to pass to the model
assistant_tools = [
    navigate_app,
    verify_kyc,
    book_slot,
    get_mandi_prices,
    create_auction
]

# Initialize model
try:
    model = genai.GenerativeModel(
        model_name="gemini-3.6-flash",
        tools=assistant_tools,
        system_instruction=(
            "You are KrishakMitra AI, a helpful farming assistant bot for farmers. "
            "You can help them book slots, verify KYC, start auctions, check crop prices, and navigate the app. "
            "Always respond politely in the language the user speaks to you (e.g., Hindi, Marathi, English). "
            "If they ask to do something you have a tool for, call that tool. Otherwise, explain how you can help."
        )
    )
except Exception as e:
    model = None
    print(f"Failed to initialize Gemini model: {e}")


def get_chat_response(message: str, language: str = "en", history: list = None) -> dict:
    if not API_KEY or model is None:
        return {
            "reply": "Sorry, my AI capabilities are currently not configured (API key missing).",
            "action": None,
            "action_data": None
        }
    
    try:
        # We can format history if needed, for simplicity we just start a new chat session per request
        # or pass it in. For now, simple single turn with context.
        chat = model.start_chat()
        
        prompt = f"User (preferred language code: {language}): {message}"
        response = chat.send_message(prompt)
        
        # Check if the model called a function
        action_name = None
        action_data = None
        
        parts = getattr(response, "parts", [])
        function_call = next((p.function_call for p in parts if getattr(p, "function_call", None)), None)
        
        if function_call:
            action_name = function_call.name
            # Convert protobuf struct to dict
            action_data = dict(function_call.args)
            
            # Send the function result back to model to get final text
            function_response = {
                "result": f"Executed {action_name} successfully."
            }
            # send_message to complete the turn
            response = chat.send_message(
                genai.types.Part.from_function_response(
                    name=action_name,
                    response=function_response
                )
            )

        return {
            "reply": response.text,
            "action": action_name,
            "action_data": action_data
        }
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {
            "reply": f"Sorry, I encountered an error: {str(e)}",
            "action": None,
            "action_data": None
        }
