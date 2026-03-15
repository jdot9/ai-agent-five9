from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from typing import Annotated, TypedDict, List, Dict, Any, Optional
from server.services.MessagingService import MessagingService
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from server.utils import parse
import operator
import logging
import json
from langgraph.types import interrupt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

logger = logging.getLogger(__name__)

LLMs = [
    ChatAnthropic(
    model="claude-sonnet-4-5-20250929",
    temperature=1
   ),
   ChatOpenAI(
       model="gpt-4o",
       temperature=0
   )
]

model = LLMs[0]

messaging_service = MessagingService()

system_prompts = {
    "classification": SystemMessage(content=(
        "'get_human': 'User wants to speak to a human.' "
        "'small_talk': 'User wants to have a conversation with you.' "
        "'send_contact_info': 'User has sent a dictionary containing firstName, lastName, email, phoneNumber' "
        "Classify user messages into: 'get_human', 'small_talk', 'send_contact_info'."
        "Return ONLY the intent label when classifying intent."
    )),

    "general_chat": SystemMessage(content=(
        "You are an AI assistant named Kakashi. Your personality is calm, cool and collected."
        "When you introduce yourself, keep it concise but friendly."
        "Share what you know about your creator ONLY when a user asks for your creator."
        "Your creator is Jason Dotson, a software engineer from Memphis, Tennessee."
        "Direct the user to jasondotson.dev ONLY if you are asked for more information on your creator."
    )) 
}

# Define state (operator.add makes messages append-only; input and node updates merge instead of overwrite)
class ChatState(TypedDict):
    messages: Annotated[List[Dict[str, str]], operator.add]
    user_info: Optional[str]
    thread_id: Optional[str]
    intent: Optional[str]
    tool_calls: List[Dict[str, Any]]
    approved: Optional[bool]
    response: Optional[str]
    summary: Optional[str]
    tenant_name: Optional[str]
    gettingHuman: Optional[bool]

# Convert state message dictionaries to LangChain message objects.
def _messages_from_state(state: ChatState) -> List:
    logger.info("Converting state message dictionaries to LangChain message objects...")
    out = []
    for message in state["messages"]:
        role, content = message.get("role", "user"), message.get("content", "")
        if role == "user":
            out.append(HumanMessage(content=content))
        elif role == "assistant":
            out.append(AIMessage(content=content))
    return out

def classify_intent(state: ChatState):
    logger.info("Asking LLM for intent label...")
    # IndexError: list index out of range
#     During task with name 'classify_intent' and id 'd3c0ad43-4f62-ac36-027c-a65d66093b9f'
    last_message = state["messages"][-1]["content"]

    # 1️⃣ Ask LLM for label
    response = model.invoke([
        system_prompts["classification"],
        HumanMessage(content=last_message)
    ])

    intent = response.content.strip().lower()
    if (intent == "send_contact_info"):
        tname = state["messages"][-1]["tenant_name"]
        return {"intent": intent, "tenant_name": tname}
    return {"intent": intent}

# Routes classification
def classification_router(state: ChatState) -> str:
  
    logger.info("Routing intent to appropriate node...")
    intent = state.get("intent")
    logger.info("Intent classified: " + intent)
  
    if intent == "get_human":
        return "get_user_info"
    
    if intent == "send_contact_info":
        return "get_five9_agent"
    
    if intent == "small_talk":
        return "general_chat"
    
    # Handle prompt injection attempts

def general_chat(state: ChatState):
    logger.info("General Chat Node")
    langchain_messages = _messages_from_state(state)
    response = model.invoke([system_prompts["general_chat"]] + langchain_messages)
    ai_content = response.content if hasattr(response, "content") else str(response)
    # Return only the new message; reducer appends it to state (no overwrite)
    return {"messages": [{"role": "assistant", "content": ai_content}], "response": ai_content}

def get_user_info(state: ChatState):
    print("Getting user info...")
    ai_content = ["First name", 
                  "Last name",
                  "Email",
                  "Phone number"]
    
    return {"messages": [{"role": "assistant", "content": ai_content}], 
            "response": ai_content, 
            "gettingHuman": True,}

def get_five9_agent(state: ChatState):
    logger.info("Getting Human...")
    contact_str = state["messages"][-1]["content"]
    contact = parse._parse_contact(contact_str)
    tenantName = state.get("tenant_name")
    response = messaging_service.start(contact, tenantName)
    if(response == "Couldn't create session because tenant does not exist."):
        return {"messages": [{"role": "assistant", 
                              "content": response}], 
                "gettingHuman": False, 
                "approved": False}
    content = json.dumps(response) if isinstance(response, dict) else str(response)
    content2 = "Request for human agent delivered. Waiting for approval..."

    return {"messages": [{"role": "assistant", 
                          "content": content2}], 
            "user_info": content, 
            "gettingHuman": False}
    

def five9_agent_response(state: ChatState):
    # Pause and ask for approval; resume with Command(resume=True) to set approved=True
    approved = interrupt("Do you approve this conversation request?")
    return {"approved": approved}

def five9_agent_response_router(state: ChatState) -> str:
    approved = state.get("approved")
    if(approved):
#        approved = interrupt("Terminate Session.")
        return "end_human_session"
    return "fallback_response"

def end_human_session(state: ChatState):
    continue_session = interrupt("Continue Session?")
    return {"approved": continue_session}
    

def fallback_response(state: ChatState):
    content = "Request for human interaction declined."
    return {"messages": [{"role": "assistant",
                          "content": content}]}

# Define Graph
graph = StateGraph(ChatState)

# Define Nodes
graph.add_node("classify_intent", classify_intent)
graph.add_node("general_chat", general_chat)
graph.add_node("get_user_info", get_user_info)
graph.add_node("get_five9_agent", get_five9_agent)
graph.add_node("five9_agent_response", five9_agent_response)
graph.add_node("end_human_session", end_human_session)
graph.add_node("fallback_response", fallback_response)

graph.add_edge(START, "classify_intent")
graph.add_conditional_edges(
    "classify_intent",
    classification_router,
    {
        "get_five9_agent": "get_five9_agent",
        "get_user_info": "get_user_info",
        "general_chat": "general_chat",
    }
)

graph.add_conditional_edges(
    "five9_agent_response",
    five9_agent_response_router,
    {
        "fallback_response": "fallback_response",
        "end_human_session": "end_human_session"
    }
)

graph.add_edge("general_chat", END)
graph.add_edge("get_user_info", END)
graph.add_edge("fallback_response", END)
graph.add_edge("end_human_session", END)
graph.add_edge("get_five9_agent", "five9_agent_response")

checkpointer = InMemorySaver()
graph = graph.compile(checkpointer=checkpointer)
#graph = graph.compile()