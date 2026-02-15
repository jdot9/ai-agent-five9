class MyMessage extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: "open"});

        // Determine if message is sent or received
        const isSent = this.hasAttribute("sent") && this.getAttribute("sent") === "true";
        const isReceived = this.hasAttribute("received") && this.getAttribute("received") === "true";
        const messageClass = isSent ? "message--sent" : isReceived ? "message--received" : "";

        shadow.innerHTML = `
            <style>
                :host {
                    max-width: 60%;
                }
                
                :host([sent="true"]) {
                    align-self: flex-end;
                }

                :host([received="true"]) {
                    align-self: flex-start;
                }

                .message {
                    display: inline-block;           /* allows width to shrink to fit text */
                    width: fit-content;              /* shrink to text length */
                    max-width: calc(100% - 20px);    /* prevent overflow */
                    min-width: 50px;                 /* optional: tiny bubbles stay readable */
                    padding: 5px 10px;
                    border-radius: 18px;
                    color: white;
                    font-weight: 900;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    margin: 10px;
                }
                
                .message--sent {
                    background-color: var(--primary-color);
                }

                .message--received {
                    background-color: var(--secondary-color);
                }

                ::slotted([slot="timestamp"]) {
                    display: block;
                    text-align: right;
                    margin-top: 8px;
                    font-size: 0.85em;
                    opacity: 0.8;
                }

            </style>

            <div class="message ${messageClass}">
                <slot></slot>
                <slot name="timestamp"></slot>
            </div>
        `
    }
}

customElements.define("my-message", MyMessage);