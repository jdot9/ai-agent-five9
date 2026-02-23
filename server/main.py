from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import asyncio


app = FastAPI()

# Get project root (parent of server)
project_root = Path(__file__).parent.parent
ui_path = project_root / "ui"
app.mount("/static", StaticFiles(directory=ui_path), name="static")

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "index.html")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept connection
    try:
        while True:
            # Receive user message
            user_message = await websocket.receive_text()
            print("User:", user_message)
            await asyncio.sleep(1)
            server_message = api_key
            # Send response to client
            await websocket.send_text(server_message)  
    except WebSocketDisconnect:
        print("Client disconnected")


