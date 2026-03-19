from email_validator import validate_email, EmailNotValidError
from fastapi import WebSocket

async def validateEmail(websocket: WebSocket):
    # Checks for valid email format, if not then user must try again
    while True:
        email = await websocket.receive_text()
        try:
            validate_email(email)
            return email
        except EmailNotValidError:
            print("Invalid email format")
            await websocket.send_text("Invalid email format. Please try again.")