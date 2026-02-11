/*
    -header contains a title, LLM Dropdown menu, and 3 buttons: 
                "clear messages", "end conversation", "hide chat".
    "end conversation" is hidden when ai agent is active.
    "LLM Dropdown menu" is hidden when ai agent is inactive.

    -body contains system messages & conversations
    -form contains an input element and a send button

*/

class MyChatRoom extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'});

        shadow.innerHTML = `
            <style>
                .chatroom {
                    position: absolute;
                    position: fixed;
                    right: 0;
                    bottom: 45px;
                    width: 280px;
                    height: 300px;
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

                .chatroom-body {
                
                }

                .chatroom-body__system-message {
                    color: var(--primary-color);
                    font-weight: 900;
                }

                .chat-room-body__conversation {
                      display: flex;
                      flex-direction: column;
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

            </style>

            <div class="chatroom">
                <div class="chatroom-header">
                    <p class="chatroom-header__title"> AI Agent </p>

                    <select class="chatroom-header__dropdown">
                        <option> Claude (Anthropic) </option>
                        <option> GPT-5 (OpenAI) </option>
                    </select>

                    <p class="chatroom-header__clear" title="Clear Conversation"> 🗑️ </p>
                    <p class="chatroom-header__exit"> X </p>
                </div>

                <div class="chatroom-body">
                
                    <div class="chatroom-body__system-message"> 
                        <p>AI Agent session paused.</p> 
                        <p> Connecting with human...  </p>
                    </div>

                    <div class="chatroom-body__conversation">
                        
                    </div>
                   
                </div>

                <form class="chatroom-form" onsubmit="">
                    <input
                        class="chatroom-form__input"
                        id="messageInput"
                        type="text"
                        placeholder="Ask anything..."
                        autocomplete="off"
                    >  
                </form>
                
            </div>

        `
    }
}

customElements.define('my-chatroom', MyChatRoom);