class MySpinner extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: "open"});

        shadow.innerHTML = `
            <style>
                .spinner {
                    width: 10px;
                    height: 10px;
                    border: 4px solid #ddd;        /* light gray ring */
                    border-top: 4px solid var(--primary-color); /* colored part */
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

            </style>

             <div class="spinner"/>

        `
    }
}

customElements.define('my-spinner', MySpinner);