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
                .chatroom {
                    position: absolute;
                    position: fixed;
                    right: 0;
                    bottom: 45px;
                    width: 320px;
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
                    color: var(--primary-color);
                    font-weight: 900;
                    padding: 3px;
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
                    height: 184px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    width: 100%;
                    box-sizing: border-box;
                }


            </style>

            <div class="chatroom">
                <div class="chatroom-header">
                    <p class="chatroom-header__title"> AI Agent </p>
                    <p class="chatroom-header__llm"> LLM: </p>
                    <my-button end-conversation="true" onClick="alert('Disconnected')">End Conversation</my-button>
                    <my-dropdown></my-dropdown>
                    <p class="chatroom-header__clear" title="Clear Conversation"> 🗑️ </p>
                    <p class="chatroom-header__exit"> X </p>
                </div>

                <div class="chatroom-body">
                
                    <div class="chatroom-body__system-message">
                        Connecting with human...
                    </div>

                    <div class="chatroom-body__conversation">
                        
                            <my-message sent="true"> 
                                The Walking Dead is better than the Last of Us.
                                <span slot="timestamp">3:00pm</span>
                            </my-message>

                            <my-message received="true">
                                You've lost your mind.
                                <span slot="timestamp">3:05pm</span>
                            </my-message>   

                            <my-message received="true">
                                Blah blah blah blah
                                <span slot="timestamp">3:08pm</span>
                            </my-message>

                             <my-message sent="true"> 
                                Now, bend the knee.
                                <span slot="timestamp">10:00pm</span>
                             </my-message>

                            <my-message sent="true"> 
                                Testing testing testing testing
                                <span slot="timestamp">11:00pm</span>
                             </my-message>
                     
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