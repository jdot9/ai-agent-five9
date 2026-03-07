from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import asyncio
import sys
import uuid
from uuid import UUID
from server.utils.validateEmail import validateEmail
from server.utils.validatePhoneNumber import validatePhoneNumber
from server.agents.chatbot import graph
from server.services.ConnectionManager import ConnectionManager
from langgraph.types import Command

thread_id = str(uuid.uuid4())
config = {"configurable": {"thread_id": thread_id}}

# Ensure project root is on path so "server" package resolves (e.g. when run from server/)
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

app = FastAPI()

ui_path = project_root / "ui"
app.mount("/static", StaticFiles(directory=ui_path), name="static")

websocket_manager = ConnectionManager()
event = asyncio.Event()

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(ui_path / "index.html")

@app.put("/conversations/{conversation_id}/typing")
async def typing_endpoint(conversation_id: UUID):
    print("Five9 agent is typing")
    return {"conversation_id": conversation_id}

@app.post("/conversations/{conversation_id}/create")
async def create_endpoint(conversation_id: UUID):
    print("Session created")
    return {"conversation_id": conversation_id}

@app.put("/conversations/{conversation_id}/accept")
async def accept_endpoint(conversation_id: UUID):
    print("Session accepted")
    # Resume the interrupted graph so interrupt() returns True and state gets approved: True
    await asyncio.to_thread(
        graph.invoke,
        Command(resume=True),
        config,
    )
    event.set()
    return {"conversation_id": conversation_id}

@app.post("/conversations/{conversation_id}/terminate")
async def terminate_endpoint(conversation_id: UUID):
    print("Session terminated")
    await asyncio.to_thread(
        graph.invoke,
        Command(resume=False),
        config,
    )
    return {"conversation_id": conversation_id}

@app.post("/conversations/{conversation_id}/message")
async def message_endpoint(conversation_id: UUID, request: Request):
    payload = await request.json()
    user = payload["displayName"]
    message = payload["text"]
    print(user + ": " + message)
    await websocket_manager.broadcast(message)
    return {"conversation_id": conversation_id}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
  
    tenant_name = None
    try:
        while True:
            user_message = await websocket.receive_text()
            print("User: ", user_message)
        
            
            result = await asyncio.to_thread(
                graph.invoke,
                {"messages": [{"role": "user", "content": user_message}], 
                 "tenant_name": tenant_name, 
                 "thread_id": thread_id},
                 config,
            )

            # Get info for Five9 Agent
            if(result.get("gettingHuman")):
                print("Get user info...")
                await websocket.send_text("Before I can connect you to a human, I need the following information from you: ")

                # Get tenant name
                await websocket.send_text("Tenant name")
                tenantName = await websocket.receive_text()
                
                # Get first name
                await websocket.send_text(result.get("response")[0])
                first_name = await websocket.receive_text()

                # Get last name
                await websocket.send_text(result.get("response")[1])
                last_name = await websocket.receive_text()
                
                # Get email address
                await websocket.send_text(result.get("response")[2])
                email = await validateEmail(websocket)

                # Get phone number
                await websocket.send_text(result.get("response")[3])
                phone_number = await validatePhoneNumber(websocket)

                contact = {"firstName": first_name,
                           "lastName": last_name,
                           "email": email,
                           "number1": phone_number}
                
                result = await asyncio.to_thread(
                    graph.invoke,
                    {"messages": [{"role": "user", "content": str(contact), 
                                   "tenant_name": tenantName}], 
                     "thread_id": thread_id},
                     config,
                )
                
                # Wait for Human Agent to approve or decline conversation request
                await event.wait()

                # Accept endpoint resumed the graph; get updated state (approved is now True)
                snapshot = await asyncio.to_thread(graph.get_state, config)
                result = snapshot.values if hasattr(snapshot, "values") else snapshot
                print("Approval status: " + str(result.get("approved")))

                # Conversation with Human Agent
                while result.get("approved"):
                    user_message = await websocket.receive_text()
                    print("User: ", user_message)
                    snapshot = await asyncio.to_thread(graph.get_state, config)
                    result = snapshot.values if hasattr(snapshot, "values") else snapshot
                    print("Approval status: " + str(result.get("approved")))
                   

        
                # Send result if failed to connect to a Five9 Human Agent
                if(not result.get("approved")):
                    for message in reversed(result["messages"]):
                        if message.get("role") == "assistant":
                            ai_text = message.get("content", "")
                            await websocket.send_text(str(ai_text))
                            break
               
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
    finally:
        websocket_manager.disconnect(websocket)
