class MyNavbar extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'})

        shadow.innerHTML = `

                <style>
                
                    nav {
                        display: flex;
                        align-items: center;             /* vertically center logo + text */
                        justify-content: space-between;  /* brand left, links right       */
                        position: fixed;
                        background-color: white;
                        width: 100%;
                    }

                    ul {
                      display: flex;
                      gap: 40px;
                      margin: 0;
                      height: 100%;
                    }

                    h3 {
                      color: #0693e3;
                    }
        
                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 10px; /* space between logo and company name */
                    }

                    /* Style slotted links directly */
                    ::slotted(a) {
                        color: black;
                        text-decoration: none;
                        font-weight: 900;
                        transition: color 0.3s ease;
                        font-size: large;
                        padding: 16px;
                        border-bottom: 1px solid transparent;
                    }

                    ::slotted(a:hover) {
                        color: #0693e3;
                        border-bottom: 1px solid #0693e3;
                    }

                    ::slotted(a:active) {
                        color: #8ed1fc;
                        border-bottom: 1px solid #8ed1fc;
                    }

                    /*  Mobile Mode */
                    @media (max-width: 600px) {
                      ul {
                          flex-direction: column;
                          gap: 10px;
                          width: 100%;
                          text-align: center;
                        } 
                    } 
                        
                </style>

                <nav class="navbar">
                    <div class="brand"> 
                         <slot name="logo"></slot>
                         <h3> Company Name LLC </h3>
                    </div>
                    <ul class="navbar__menu">
                        <slot></slot>
                    </ul>
                </nav>
        `
    }
}

customElements.define("my-navbar", MyNavbar);