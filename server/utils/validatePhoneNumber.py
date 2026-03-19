
from fastapi import WebSocket
import phonenumbers
from phonenumbers import NumberParseException

async def validatePhoneNumber(websocket: WebSocket):
    # Validate phone number, if invalid then user must try again
    while True:
        phone_number = await websocket.receive_text()
        try:
            parsed_number = phonenumbers.parse(phone_number, None)

            if phonenumbers.is_valid_number(parsed_number):
                print("Valid phone number.")
                return phone_number
            else:
                print("Invalid phone number.")
                await websocket.send_text("Invalid phone number format. Please try again. (include country code, e.g. +14155552671)")

        except NumberParseException:
            print("Could not parse phone number.")
            await websocket.send_text("Invalid phone number format. Please try again. (include country code, e.g. +14155552671)")