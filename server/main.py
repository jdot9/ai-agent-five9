from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from agents.weather_agent import run_agent
from pathlib import Path
import asyncio

app = FastAPI()

# Get project root (parent of server)
project_root = Path(__file__).parent.parent
ui_path = project_root / "ui"
app.mount("/static", StaticFiles(directory=ui_path), name="static")
print("Serving HTML from:", ui_path / "chat.html")

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "chat.html")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept connection
    try:
        while True:
            # Receive user message
            user_message = await websocket.receive_text()
            print("User:", user_message)

            # Run your agent
            agent_response = run_agent(user_message, user_id="1", thread_id="1")
            response_text = agent_response.punny_response

           # Split into words and send one at a time
            words = response_text.split()
            for word in words:
                await websocket.send_text(word + " ")  # append space after each word
                await asyncio.sleep(0.05)  # adjust speed as needed

            await websocket.send_text("<END>")  # mark end of message
    except WebSocketDisconnect:
        print("Client disconnected")


