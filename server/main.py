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
    tenant_name = None
    try:
        while True:
            user_message = await websocket.receive_text()
            print("User:", user_message)
        
            config = {"configurable": {"thread_id": thread_id}}
            result = await asyncio.to_thread(
                graph.invoke,
                {"messages": [{"role": "user", "content": user_message}], "tenant_name": tenant_name, "thread_id": thread_id},
                config,
            )
            # Get info for Five9 Agent
            if(result.get("gettingHuman")):
                print("Get user info...")
                
                await websocket.send_text("Before I can connect you to a human, I need the following information from you: ")
                await websocket.send_text("Tenant name")
                tenantName = await websocket.receive_text()
                
                # Verify tenant name exists,

                await websocket.send_text(result.get("response")[0])
                first_name = await websocket.receive_text()
                await websocket.send_text(result.get("response")[1])
                last_name = await websocket.receive_text()
                await websocket.send_text(result.get("response")[2])
                email = await websocket.receive_text()
                await websocket.send_text(result.get("response")[3])
                phone_number = await websocket.receive_text()

                contact = {"firstName": first_name,
                           "lastName": last_name,
                           "email": email,
                           "number1": phone_number}
                
                print(contact)
                result = await asyncio.to_thread(
                    graph.invoke,
                    {"messages": [{"role": "user", "content": str(contact), "tenant_name": tenantName}], "thread_id": thread_id},
                    config,
                )
                
                print("Contact: " + str(contact))
                print(result)
                
            else:
            # Prefer explicit response; else last assistant message
                ai_text = result.get("response")
                print("AI: " + ai_text)
                if not ai_text and result.get("messages"):
                    for message in reversed(result["messages"]):
                        if message.get("role") == "assistant":
                            ai_text = message.get("content", "")
                            break
                if not ai_text:
                    ai_text = "I have failed to connect to an LLM."

                await websocket.send_text(ai_text)  
    except WebSocketDisconnect:
        print("Client disconnected")
