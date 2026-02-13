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
                    <a href="#">Claude Sonnet 4.5</a>
                    <a href="#">Gemini 3</a>
                    <a href="#">GPT-5</a>
                </div>
            </div>
        `;
    }
}

customElements.define('my-dropdown', MyDropdown);