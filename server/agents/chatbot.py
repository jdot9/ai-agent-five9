from langgraph.graph import StateGraph, START, END
from typing import Annotated, TypedDict, List, Dict, Any, Optional
import operator
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

logger = logging.getLogger(__name__)

#model = ChatOpenAI(model="gpt-4o", temperature=0) 
model = ChatAnthropic(
    model="claude-sonnet-4-5-20250929",
    temperature=0
)

system_prompts = {
    "classification": SystemMessage(content=(
        "'get_human': 'User wants to speak to a human.' "
        "'small_talk': 'User wants to have a conversation with you.' "
        "Classify user messages into: 'get_human', 'small_talk'."
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
    thread_id: Optional[str]
    intent: Optional[str]
    tool_calls: List[Dict[str, Any]]
    approved: Optional[bool]
    response: Optional[str]
    summary: Optional[str]

def classify_intent(state: ChatState):
    logger.info("Asking LLM for intent label...")
    last_message = state["messages"][-1]["content"]

    # 1️⃣ Ask LLM for label
    response = model.invoke([
        system_prompts["classification"],
        HumanMessage(content=last_message)
    ])

    intent = response.content.strip().lower()
    return {"intent": intent}

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

def general_chat(state: ChatState):
    logger.info("General Chat Node")
    langchain_messages = _messages_from_state(state)
    response = model.invoke([system_prompts["general_chat"]] + langchain_messages)
    ai_content = response.content if hasattr(response, "content") else str(response)
    # Return only the new message; reducer appends it to state (no overwrite)
    return {"messages": [{"role": "assistant", "content": ai_content}], "response": ai_content}

def get_five9_agent(state: ChatState):
    return 


def fallback_response(state: ChatState):
    return

def summarize_conversation(state: ChatState):
    return

# Define routers
def classification_router(state: ChatState) -> str:
  
    logger.info("Routing intent to appropriate node...")
    intent = state.get("intent")
    logger.info("Intent classified: " + intent)
  
    if intent == "get_human":
        return "get_five9_agent"
    
    if intent == "small_talk":
        return "general_chat"
    
    
def five9_agent_router(state: ChatState) -> str:
    approved = state.get("approved")

    if approved:
        return "summarize_conversation"

    return "fallback_response"

# Define Graph
graph = StateGraph(ChatState)

# Define Nodes
graph.add_node("classify_intent", classify_intent)
graph.add_node("get_five9_agent", get_five9_agent)
graph.add_node("general_chat", general_chat)
graph.add_node("fallback_response", fallback_response)
graph.add_node("summarize_conversation", summarize_conversation)

graph.add_edge(START, "classify_intent")
graph.add_conditional_edges(
    "classify_intent",
    classification_router,
    {
        "get_five9_agent": "get_five9_agent",
        "general_chat": "general_chat",
    }
)

graph.add_conditional_edges(
    "get_five9_agent",
    five9_agent_router,
    {
        "fallback_response": "fallback_response",
        "summarize_conversation": "summarize_conversation"
    }
)

graph.add_edge("fallback_response", END)
graph.add_edge("summarize_conversation", END)
graph.add_edge("general_chat", END)

checkpointer = InMemorySaver()
graph = graph.compile(checkpointer=checkpointer)
#graph = graph.compile()