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

                :host([dropdown="true"]) button {
                    padding: 3px;
                }

                :host([end-conversation="true"]) button {
                    padding: 3px;
                    position: absolute;
                    right: 0;
                    margin-right: 16%;
                    margin-top: 5%;
                }

                :host([end-conversation="true"]) button:hover {
                    background-color: red;
                    color: white;
                }

                :host([end-conversation="true"]) button:active {
                    background-color: white;
                    color: black;
                }

                :host([variant="primary"]) button {
                    background-color: var(--primary-color);
                    color: white;
                }

                :host([variant="primary"]) button:hover {
                    background-color: var(--primary-color-hover);
                }

                :host([variant="primary"]) button:active {
                    background-color: var(--primary-color-active);
                }

                :host([variant="secondary"]) button {
                    background-color: var(--secondary-color);
                    color: white;
                }

                :host([variant="secondary"]) button:hover {
                    background-color: var(--secondary-color-hover);
                }

                :host([variant="secondary"]) button:active {
                    background-color: var(--secondary-color-active);
                }
                    
            </style>

            <button class="btn"> 
                <slot></slot>
            </button>

        `
    }
}

customElements.define('my-button', MyButton);

