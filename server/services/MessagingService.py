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
        print(response.status_code)
        return response
    
    def start(self, contact: dict[str, str], tenantName):
        sessionResponse = asyncio.run(self.createSession(tenantName))
        print(sessionResponse.json())
        if (sessionResponse.status_code != 200):
            print("Couldn't create session because tenant does not exist.")
            return "Couldn't create session because tenant does not exist."
        tokenId = sessionResponse.json()["tokenId"]
        orgId = sessionResponse.json()["orgId"]
        farmId = sessionResponse.json()["context"]["farmId"]
        sessionId = sessionResponse.json()["sessionId"]
      # host = sessionResponse.json()["metadata"]["apiUrls"]["host"]
      # port = sessionResponse.json()["metadata"]["apiUrls"]["port"]

        conversationResponse = asyncio.run(self.createConversation(contact, tokenId, farmId, orgId))      
        return conversationResponse.json()






