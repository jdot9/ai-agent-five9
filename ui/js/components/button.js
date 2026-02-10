class MyButton extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'})

        shadow.innerHTML = `
            <style>

                .btn {
                    cursor: pointer;
                    padding: 12px 25px;
                    border: none;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s ease;
                }

                :host([variant="primary"]) button {
                    background-color: #0693e3;
                    color: white;
                }

                :host([variant="primary"]) button:hover {
                    background-color: #22a4ef;
                }

                :host([variant="primary"]) button:active {
                    background-color: #8ed1fc;
                }

                :host([variant="secondary"]) button {
                    background-color: black;
                    color: white;
                }

                :host([variant="secondary"]) button:hover {
                    background-color: #3f3e3e;
                }

                :host([variant="secondary"]) button:active {
                    background-color: rgb(116, 118, 119);
                }
                    
            </style>

            <button class="btn"> 
                <slot></slot>
            </button>

        `
    }
}

customElements.define('my-button', MyButton);

