/*
    -header contains a title, LLM Dropdown menu, and 3 buttons: 
                "clear messages", "end conversation", "hide chat".
    "End Conversation" is hidden when ai agent is active.
    "LLM Dropdown menu" is hidden when ai agent is inactive.

    -body contains system messages & conversations
    -form contains an input element and a send button

*/

import { createTimestamp } from "../utils/createTimestamp.js";
import { createMessage } from "../utils/createMessage.js";
import { initiateTerminateConversation } from "../services/TerminationService.js";
class MyChatRoom extends HTMLElement {

         constructor() {
            super();
            this.attachShadow({mode: 'open'})
        }
        
        connectedCallback() {
            this.render();
            this.setupEvents();
        }

        render() {
        this.shadowRoot.innerHTML = `
            <style>
                .hidden {
                    display: none;
                }

                .chatroom {
                    position: absolute;
                    position: fixed;
                    right: 0;
                    bottom: 45px;
                    width: 320px;
                    height: 400px;
                    background-color: white;
                    border: 2px solid black;
                    border-radius: 4%;
                }

                .chatroom-header {
                    background-color: black;
                    width: 100%;
                    height: 15%;
                    color: white;
                    display: flex;
                }

                .chatroom-header__title {
                    margin-left: 10px;
                }

                .chatroom-header__llm {
                    margin-left: 11%;
                    visibility: visible;
                }
                
                .chatroom-header__clear {
                    position: absolute;
                    right: 20px;
                    margin-right: 5px;
                }

                .chatroom-header__clear:hover {
                    background-color: #A52A2A;
                }

                .chatroom-header__exit {
                    position: absolute;
                    right: 0;
                    margin-right: 5px;
                    font-weight: 900;
                }

                .chatroom-header__exit:hover {
                   color: red;
                }

                .chatroom-header__dropdown {
                    position: absolute;
                    right: 0;
                    margin-right: 16%;
                    margin-top: 6%;
                }

                .chatroom-body__system-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: white;
                    font-weight: 900;
                    padding: 3px;
                    background-color: black;
                }

                .chatroom-form {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    margin-bottom: 3%;
                }

                .chatroom-form__input {
                    box-sizing: border-box;
                    border-radius: 25px;
                    border: 1px solid #3f3f3f;
                    font-size: large;
                    font-weight: 900;
                    height: 35px;
                    width: 95%;
                    padding: 3%;
                }

                .chatroom-form__input:focus {
                    outline: 2px solid var(--primary-color); 
                }
                
                .chatroom-body__conversation {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    height: 271px; 
                    overflow-y: auto;
                    overflow-x: hidden;
                    width: 100%;
                    box-sizing: border-box;
                }

                .chatroom-body__typing {
                    margin-top: auto;
                    align-self: flex-start;
                    flex-shrink: 0;
                    padding: 6px 10px;
                    font-size: 0.85rem;
                    color: #666;
                    font-style: italic;
                }

                .chatroom-body__typing.hidden {
                    display: none;
                }

                img {
                    cursor: pointer; 
                    border-radius: 50%; 
                    width: 100px; 
                    height: 100px; 
                    position: absolute; 
                    position: fixed; 
                    right: 0; 
                    bottom: 47px; 
                    margin-right: 1%;
                }

                img:hover {
                    transform: scale(1.2);
                }


            </style>
            
            <img src="static/assets/chatbot-icon.png" 
                 id="showChatBtn" 
                 alt="Toggle chat"
            >

            <div class="chatroom hidden">
                <div class="chatroom-header">
                    <p class="chatroom-header__title" id="humanOrAi"> AI Agent </p>
                    <p class="chatroom-header__llm" id="llm"> LLM: </p>
                    <my-button end-conversation="true" onClick="initiateTerminateConversation()" id="terminate-conversation-btn">End Conversation</my-button>
                    <my-dropdown id="llm-dropdown"></my-dropdown>
                    <p id="clear-convo" class="chatroom-header__clear" title="Clear Conversation"> 🗑️ </p>
                    <p id="hideChatBtn" class="chatroom-header__exit"> X </p>
                </div>

                <div class="chatroom-body">
                
                    <div class="chatroom-body__system-message" id="systemMessage">
                        <my-spinner class="hidden" id="spinner"></my-spinner>
                        <span id="systemMessageText">Kakashi</span>
                    </div>

                    <div class="chatroom-body__conversation">
                        <p class="chatroom-body__typing hidden" id="typingIndicator" aria-live="polite"></p>
                    </div>
                </div>

                <form id="formId" class="chatroom-form">
                    <input
                        class="chatroom-form__input"
                        id="messageInput"
                        type="text"
                        placeholder="Ask anything..."
                        autocomplete="off"
                    >  
                </form>
                
            </div>

        `;
        }

        setupEvents() {

            const shadow = this.shadowRoot;
            // Connect to the backend WebSocket on the same host the UI was loaded from.
            // This avoids hard-coding ngrok URLs.
            const scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
            const ws = new WebSocket(scheme + window.location.host + "/ws");
            const messageContainer = shadow.querySelector(".chatroom-body__conversation");
            const typingIndicator = shadow.getElementById("typingIndicator");
            const clearBtnId = shadow.getElementById("clear-convo");
            const inputId = shadow.getElementById("messageInput");
            const formId = shadow.getElementById("formId");
            const showChatBtnId = shadow.getElementById("showChatBtn");
            const hideChatBtnId = shadow.getElementById("hideChatBtn");
            const systemMessageId = shadow.getElementById("systemMessage");
            const systemMessageTextId = shadow.getElementById("systemMessageText");
            const humanOrAiId = shadow.getElementById("humanOrAi");
            const llmId = shadow.getElementById("llm");
            const llmDropdownId = shadow.getElementById("llm-dropdown");
            const spinnerId = shadow.getElementById("spinner");
            const chatroomClass = shadow.querySelector(".chatroom");
            const terminateConversationBtnId = shadow.getElementById("terminate-conversation-btn");
            // Log websocket connection
            ws.onopen = () => {
                console.log("Connected to WebSocket");
            };

            // Receive message from backend: either plain-text chat or JSON (typing indicator / control payload).
            // Only call JSON.parse when payload looks like JSON to avoid SyntaxError on plain text (e.g. "Request for...").
            ws.onmessage = (event) => {
                const raw = typeof event.data === "string" ? event.data : String(event.data);
                const looksLikeJson = raw.trim().startsWith("{");
                if (looksLikeJson) {
                    try {
                        const data = JSON.parse(raw);
                        const isHuman = data.isHuman;
                        const name = data.displayName || "Five9 Agent";
                        const connectingToHuman = data.connectingToHuman;

                        // Update system message and header from control payload (connecting / human vs AI).
                        if (connectingToHuman) {    
                            systemMessageTextId.textContent = "Awaiting human approval...";
                            spinnerId.classList.remove("hidden")
                            return;
                        }

                        if (isHuman) {
                            //if (systemMessageTextId) 
                            systemMessageTextId.textContent = name;
                            humanOrAiId.textContent = "Human Agent";
                            llmDropdownId.classList.add("hidden");
                            llmId.classList.add("hidden");
                            spinnerId.classList.add("hidden")
                        } else {
                           // if (systemMessageTextId) 
                            systemMessageTextId.textContent = "Kakashi";
                            humanOrAiId.textContent = "Ai Agent";
                            llmDropdownId.classList.remove("hidden");
                            llmId.classList.remove("hidden");
                        }

                        // broadcast_typing payload: show/hide typing indicator (p#typingIndicator) only; no chat bubble.
                        if (data.type === "typing" && typingIndicator) {
                            if (data.is_typing) {
                                typingIndicator.textContent = `${name} is typing...`;
                                typingIndicator.classList.remove("hidden");
                            } else {
                                typingIndicator.classList.add("hidden");
                                typingIndicator.textContent = "";
                            }
                            return;
                        }
                        // Other JSON (control only): do not render as a message.
                        return;
                    } catch (_) {
                        // Malformed JSON: fall through and show raw string as a chat message.
                    }
                }
                // Plain text or non-JSON: display as a received chat message above the typing indicator.
                const serverMessage = createMessage(raw, "received");
                serverMessage.appendChild(createTimestamp());
                messageContainer.insertBefore(serverMessage, typingIndicator);
                serverMessage.scrollIntoView({ behavior: "smooth" });
                if (typingIndicator) {
                    typingIndicator.classList.add("hidden");
                    typingIndicator.textContent = "";
                }
            }

            // Send message to backend
            formId.addEventListener("submit", (event) => {
                event.preventDefault();

                const message = inputId.value.trim();
                if (!message) return;

                inputId.value = ""; // clear input
                const userMsgBubble = createMessage(message, "sent");
                userMsgBubble.appendChild(createTimestamp());
                messageContainer.insertBefore(userMsgBubble, typingIndicator);

                userMsgBubble.scrollIntoView({ behavior: "smooth" });
                ws.send(message);
                console.log(`Message sent: ${message}`);
            });

            // Clear conversation history
            clearBtnId.addEventListener("click", () => {
                messageContainer.replaceChildren();
                typingIndicator.classList.add("hidden");
                typingIndicator.textContent = "";
            });

            // Show/hide chatroom  
            showChatBtnId.addEventListener("click", () => {
                chatroomClass.classList.toggle("hidden");
            });

            hideChatBtnId.addEventListener("click", () => {
                chatroomClass.classList.toggle("hidden");
            });

            terminateConversationBtnId.addEventListener("click", () => {
                initiateTerminateConversation();
            });
        }
}

customElements.define('my-chatroom', MyChatRoom);