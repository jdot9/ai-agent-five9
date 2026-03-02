import httpx
import asyncio
import logging
import os

class MessagingService:
    def __init__(self):
        self.campaignName = "Inbound"
        self.baseUrl = os.environ.get("FIVE9_BASE_URL")
        self.callbackUrl = os.environ.get("CALLBACK_URL")
            
    async def createSession(self, tenantName):
        my_headers = {"Content-Type": "application/json"}
        payload = {"tenantName": tenantName}
        endpoint = "/appsvcs/rs/svc/auth/anon?cookieless=true"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.baseUrl + endpoint,
                headers=my_headers,
                json=payload
            )
        print(response.json())
        return response

    async def createConversation(self, contact, tokenId, farmId, orgId):
        my_headers = {"farmId": farmId,
                      "Authorization": "Bearer " + tokenId}
        
        payload = {"tenantId": orgId,
                   "callbackUrl": self.callbackUrl,
                   "campaignName": "Inbound",
                   "contact": contact}

        endpoint = "/appsvcs/rs/svc/conversations"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.baseUrl + endpoint,
                headers=my_headers,
                json=payload
            )
        print(response.json())
        return response
    
    def start(self, contact: dict[str, str], tenantName):
        createSessionResponse = asyncio.run(self.createSession(tenantName))
        tokenId = createSessionResponse.json()["tokenId"]
        orgId = createSessionResponse.json()["orgId"]
        farmId = createSessionResponse.json()["context"]["farmId"]
        sessionId = createSessionResponse.json()["sessionId"]
      # host = createSessionResponse.json()["metadata"]["apiUrls"]["host"]
      # port = createSessionResponse.json()["metadata"]["apiUrls"]["port"]

        createConversationResponse = asyncio.run(self.createConversation(contact, tokenId, farmId, orgId))      
        return createConversationResponse.json()






