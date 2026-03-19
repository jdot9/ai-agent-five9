import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(message)
            except Exception:
                self.active_connections.remove(connection)

    async def broadcast_typing(self, display_name: str, is_typing: bool = True, is_human: bool = True, connecting_to_human: bool = False):
        # Broadcast a typing indicator to all connected clients. Payload is JSON so clients can distinguish from chat messages.
        payload = json.dumps({
            "type": "typing",
            "displayName": display_name,
            "is_typing": is_typing,
            "isHuman": is_human,
            "connectingToHuman": connecting_to_human
        })
        await self.broadcast(payload)

    async def broadcast_name(self, display_name: str, is_human: bool = True, connecting_to_human: bool = False):
        payload = json.dumps({
            "displayName": display_name,
            "isHuman": is_human,
            "connectingToHuman": connecting_to_human
        })
        await self.broadcast(payload)

    async def broadcast_connecting_to_human(self, connecting_to_human: bool = True):
        payload = json.dumps({
            "connectingToHuman": connecting_to_human
        })
        await self.broadcast(payload)