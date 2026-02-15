/*
    -header contains a title, LLM Dropdown menu, and 3 buttons: 
                "clear messages", "end conversation", "hide chat".
    "End Conversation" is hidden when ai agent is active.
    "LLM Dropdown menu" is hidden when ai agent is inactive.

    -body contains system messages & conversations
    -form contains an input element and a send button

*/

class MyChatRoom extends HTMLElement {
    connectedCallback() {
    
        const shadow = this.attachShadow({mode: 'open'});

        shadow.innerHTML = `
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

                <form class="chatroom-form" onsubmit="sendMessage(event)">
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

        const messageContainer = shadow.querySelector(".chatroom-body__conversation");
        const ws = new WebSocket("ws://127.0.0.1:8000/ws");

        ws.onopen = () => {
            console.log("Connected to WebSocket");
            console.log(messageContainer);
        };

        // Handle incoming words from the backend
        ws.onmessage = (event) => {
            const response = event.data;
            console.log(response);

            const serverMessage = document.createElement("my-message");
            serverMessage.textContent = response;
            serverMessage.setAttribute("received","true");

            //[] = use my system default locale
            const time = new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });
            
            const timestamp = document.createElement("span");
            timestamp.setAttribute("slot", "timestamp");
            timestamp.textContent = time;

            messageContainer.appendChild(serverMessage);
            serverMessage.appendChild(timestamp);
        }

      // Called when form is submitted
      window.sendMessage = function (event) {
            event.preventDefault();
            const input = shadow.getElementById("messageInput");
            const message = input.value.trim();
            if (!message) return;

            input.value = ""; // clear input

            // Render user's message first as a paragraph
            const userMsg = document.createElement("my-message");
            userMsg.setAttribute("sent", "true");
            userMsg.textContent = message;

            //[] = use my system default locale
            const time = new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });

            const timestamp = document.createElement("span");
            timestamp.setAttribute("slot", "timestamp");
            timestamp.textContent = time;

            messageContainer.appendChild(userMsg);
            userMsg.appendChild(timestamp);

            // Scroll user message into view
            userMsg.scrollIntoView({ behavior: "smooth" });

            // Send user's message to the WebSocket
            ws.send(message);

            console.log(`Message sent: ${message}`);
        }

        // Clear conversation history
        

        // Hide or show chat
        const showChatBtn = shadow.getElementById("showChatBtn");
        const hideChatBtn = shadow.getElementById("hideChatBtn");
        const chatroom = shadow.querySelector(".chatroom");
        if (showChatBtn && chatroom || hideChatBtn && chatroom) {
            showChatBtn.addEventListener("click", () => {
                chatroom.classList.toggle("hidden");
            });
            hideChatBtn.addEventListener("click", () => {
                chatroom.classList.toggle("hidden");
            });
        }
    }
}

customElements.define('my-chatroom', MyChatRoom);