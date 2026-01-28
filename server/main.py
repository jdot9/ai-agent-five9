from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import logging
import os

app = FastAPI()

# Mount the ui directory at /static
app.mount("/static", StaticFiles(directory="ui"), name="static")  # adjust path if needed

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(os.path.join("ui", "chat.html"))

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept the connection
    try:
        while True:
            data = await websocket.receive_text()  # Receive text from client
            print("User: " + data)
            await websocket.send_text(f"Server received: {data}")  # Echo back
    except WebSocketDisconnect:
            print("Client disconnected")
