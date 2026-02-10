class MyFooter extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'});
        
        shadow.innerHTML = `

            <style>

                .footer {
                    background-color: black;
                    color: white;
                    width: 100%;
                    bottom: 0;
                    position: fixed;
                    height: 25px;
                    padding: 10px;
                    display: flex;
                    flex-wrap: nowrap;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.5em;
                }

                .footer p {
                    margin-right: 30%;
                }

                .footerLink {
                    color: white;
                    text-decoration: none;
                    font-size: 1.1rem;
                    font-weight: 900;
                    font-family: 'Arial', sans-serif;
                    font-style: italic;
                    transition: color 0.3s ease;  
                    padding-right: 1%;
                }


                .footerLink:hover {
                    color: #539ff0;
                }

            </style>

            <footer class="footer">
                <p>© 2026 Company Name LLC. All rights reserved.</p>
                <a href="https://www.jasondotson.dev" 
                   class="footerLink" 
                   target="_blank" 
                   rel="noopener noreferrer">
                   jasondotson.dev
                </a>
            </footer>

        `
    }
}

customElements.define('my-footer', MyFooter)