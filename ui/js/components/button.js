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

