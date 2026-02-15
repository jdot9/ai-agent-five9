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
components_path = project_root / "ui/components"
app.mount("/static", StaticFiles(directory=ui_path), name="static")
print("Serving HTML from:", components_path / "chat.html")

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "index.html")

# Serve your HTML page at chat
@app.get("/chat")
def read_index():
    return FileResponse(components_path / "chat.html")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept connection
    try:
        while True:
            # Receive user message
            user_message = await websocket.receive_text()
            print("User:", user_message)
            await asyncio.sleep(1)
            server_message = "This is a test message from the server"
            # Send response to client
            await websocket.send_text(server_message)  
    except WebSocketDisconnect:
        print("Client disconnected")


