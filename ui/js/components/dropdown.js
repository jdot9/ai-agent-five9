
class MyDropdown extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: "open"});
        
        shadow.innerHTML = `
            
        <style>
                .dropdown {
                    position: absolute;
                    right: 0;
                    margin-right: 16%;
                    margin-top: 5%;
                }

                .dropdown my-button {
                    display: block;
                    width: 122px;
                    min-width: 122px;
                    max-width: 122px;
                    box-sizing: border-box;
                }

                .dropdown-content {
                    display: none;
                    position: absolute;
                    background: white;
                    border: 1px solid #ccc;
                    min-width: 130px;
                    z-index: 1;
                }

                .dropdown-content a {
                    display: block;
                    text-decoration: none;
                    color: black;
                    padding: 5px;
                }
                .dropdown-content a:hover {
                    background-color: var(--primary-color);
                    color: white;
                }

                .dropdown-content a:active {
                    background-color: var(--primary-color-active);
                }

                .dropdown:hover .dropdown-content {
                    display: block;
                }
               
        </style>
           
            <div class="dropdown">
                <my-button dropdown="true">Claude Sonnet 4.5</my-button>
                <div class="dropdown-content">
                    <a href="#" data-model="0">Claude Sonnet 4.5</a>
                    <a href="#" data-model="1">GPT-4o</a>
                    <a href="#" data-model="2">Gemini-3.1</a>
                </div>
            </div>
        `;

        // Wire dropdown selections to backend model switching.
        // This file is loaded as a plain <script>, so we can't use a static `import ...` at top-level.
        // Instead we dynamically import `setLLMModel` and cache it.
        const setLLMModelPromise = import("../services/LLMService.js").then((mod) => mod.setLLMModel);

        const button = shadow.querySelector("my-button");
        const links = shadow.querySelectorAll('a[data-model]');
        links.forEach((a) => {
            a.addEventListener("click", async (event) => {
                event.preventDefault();
                button.textContent = a.textContent;
                const model = a.getAttribute("data-model");
                try {
                    const setLLMModel = await setLLMModelPromise;
                    await setLLMModel(model);
                } catch (err) {
                    console.error("Failed to set LLM model:", err);
                }
            });
        });
    }
}

customElements.define('my-dropdown', MyDropdown);