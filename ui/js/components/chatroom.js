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
                    <p class="chatroom-header__title"> AI Agent </p>
                    <p class="chatroom-header__llm"> LLM: </p>
                    <my-button end-conversation="true" onClick="alert('Disconnected')">End Conversation</my-button>
                    <my-dropdown></my-dropdown>
                    <p id="clear-convo" class="chatroom-header__clear" title="Clear Conversation"> 🗑️ </p>
                    <p id="hideChatBtn" class="chatroom-header__exit"> X </p>
                </div>

                <div class="chatroom-body">
                
                    <div class="chatroom-body__system-message">
                        Connecting with human... 
                    </div>

                    <div class="chatroom-body__conversation">
                            
                     
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
            const ws = new WebSocket("ws://127.0.0.1:8000/ws");
            const messageContainer = shadow.querySelector(".chatroom-body__conversation");
            const clearBtnId = shadow.getElementById("clear-convo");
            const inputId = shadow.getElementById("messageInput");
            const formId = shadow.getElementById("formId");
            const showChatBtnId = shadow.getElementById("showChatBtn");
            const hideChatBtnId = shadow.getElementById("hideChatBtn");
            const chatroomClass = shadow.querySelector(".chatroom");
            
            // Log websocket connection
            ws.onopen = () => {
                console.log("Connected to WebSocket");
            };

            // Receive message from backend
            ws.onmessage = (event) => {
                const serverMessage = createMessage(event.data, "received");
                messageContainer.appendChild(serverMessage);
                serverMessage.appendChild(createTimestamp());
            }

            // Send message to backend
            formId.addEventListener("submit", (event) => {
                event.preventDefault();

                const message = inputId.value.trim();
                if (!message) return;

                inputId.value = ""; // clear input
                const userMsgBubble = createMessage(message, "sent")
                messageContainer.appendChild(userMsgBubble);
                userMsgBubble.appendChild(createTimestamp());

                userMsgBubble.scrollIntoView({ behavior: "smooth" });
                ws.send(message);
                console.log(`Message sent: ${message}`);
            });

            // Clear conversation history
            clearBtnId.addEventListener("click", () => {
                messageContainer.replaceChildren();
            });

            // Show/hide chatroom  
            showChatBtnId.addEventListener("click", () => {
                chatroomClass.classList.toggle("hidden");
            });
            hideChatBtnId.addEventListener("click", () => {
                chatroomClass.classList.toggle("hidden");
            });
            
        }
}

customElements.define('my-chatroom', MyChatRoom);