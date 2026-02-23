from langgraph.graph import StateGraph, MessagesState, START, END
from typing import TypedDict, List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o", temperature=0) 

# Define state
class ChatState(TypedDict):
    messages: List[Dict[str, str]]
    intent: Optional[str]
    confidence: Optional[float]
    tool_calls: List[Dict[str, Any]]
    approved: Optional[bool]
    response: Optional[str]
    summary: Optional[str]

def classify_intent(state: ChatState):
    return

def get_five9_agent(state: ChatState):
    return

def general_chat(state: ChatState):
    return

def clarify(state: ChatState):
    return

def fallback_response(state: ChatState):
    return

def summarize_conversation(state: ChatState):
    return

# Define routers
def classification_router(state: ChatState) -> str:
    intent = state.get("intent")
    confidence = state.get("confidence", 0)

    if confidence < 0.7:
        return "clarify"

    if intent == "get_human":
        return "get_five9_agent"

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
graph.add_node("clarify", clarify)
graph.add_node("fallback_response", fallback_response)
graph.add_node("summarize_conversation", summarize_conversation)

graph.add_edge(START, "classify_intent")
graph.add_conditional_edges(
    "classify_intent",
    classification_router,
    {
        "get_five9_agent": "get_five9_agent",
        "general_chat": "general_chat",
        "clarify": "clarify"
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
graph.add_edge("clarify", END)
graph = graph.compile()

graph.invoke({"messages": [{"role": "user", "content": "hi!"}]})