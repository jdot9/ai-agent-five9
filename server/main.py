from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import asyncio
import sys
import uuid

# import uvicorn

#if __name__ == "__main__":
 #   uvicorn.run("main:app", reload=True)
    
# Ensure project root is on path so "server" package resolves (e.g. when run from server/)
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from server.agents.chatbot import graph

app = FastAPI()

ui_path = project_root / "ui"
app.mount("/static", StaticFiles(directory=ui_path), name="static")

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "index.html")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    thread_id = str(uuid.uuid4())
    try:
        while True:
            user_message = await websocket.receive_text()
            print("User:", user_message)

            config = {"configurable": {"thread_id": thread_id}}
            result = await asyncio.to_thread(
                graph.invoke,
                {"messages": [{"role": "user", "content": user_message}], "thread_id": thread_id},
                config,
            )
            
            # Prefer explicit response; else last assistant message
            ai_text = result.get("response")
            if not ai_text and result.get("messages"):
                for message in reversed(result["messages"]):
                    if message.get("role") == "assistant":
                        ai_text = message.get("content", "")
                        break
            if not ai_text:
                ai_text = "I didn't understand. Could you rephrase?"

            await websocket.send_text(ai_text)  
    except WebSocketDisconnect:
        print("Client disconnected")
