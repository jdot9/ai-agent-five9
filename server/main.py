
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


# Mount the ui directory at /static
#app.mount("/static", StaticFiles(directory="ui"), name="static")  # adjust path if needed

#app = FastAPI()

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "chat.html")
    #return FileResponse(os.path.join("ui", "chat.html"))



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



"""
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # Accept connection

    try:
        while True:
            # Receive user message
            user_message = await websocket.receive_text()
            print("User:", user_message)

            # Run your agent
            # Use a fixed user_id and thread_id for example
            agent_response = run_agent(user_message, user_id="1", thread_id="1")

            # Send agent's response back
            await websocket.send_text(agent_response.punny_response)

    except WebSocketDisconnect:
        print("Client disconnected")


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
"""
