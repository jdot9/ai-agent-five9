const ws = new WebSocket("ws://127.0.0.1:8000/ws");
//const publicURL = "https://simmeringly-remarkable-abdul.ngrok-free.dev/"
//const ws = new WebSocket("wss://simmeringly-remarkable-abdul.ngrok-free.dev/ws");
//const outputElement = document.querySelector(".output-group__answer");
const outputGroup = document.querySelector(".output-group"); // container for responses
const outputAnswer = outputGroup.querySelector(".output-group__answer");

ws.onopen = () => {
    console.log("Connected to WebSocket");
};

let currentOutput = null; 

// Handle incoming words from the backend
ws.onmessage = (event) => {
    const word = event.data;

    if (!currentOutput) {
        // Create a new <h3> for this response
        currentOutput = document.createElement("h3");
        currentOutput.classList.add("output-group__answer");
        outputGroup.appendChild(currentOutput);
    }

    if (word === "<END>") {
        // Finished this response → insert <hr>
        const hr = document.createElement("hr");
        outputGroup.appendChild(hr);

        // Reset currentOutput for next response
        currentOutput = null;

        // Scroll hr into view
        hr.scrollIntoView({ behavior: "smooth" });
    } else {
        // Append word to current <h3>
        currentOutput.textContent += word;
        currentOutput.scrollIntoView({ behavior: "smooth" });
    }
};

// Called when form is submitted
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (!message) return;

    input.value = ""; // clear input

    // Render user's message first as a paragraph
    const userMsg = document.createElement("h3");
    userMsg.textContent = message;
    userMsg.classList.add("user-message");
    outputGroup.appendChild(userMsg);

    // Scroll user message into view
    userMsg.scrollIntoView({ behavior: "smooth" });

    // Send user's message to the WebSocket
    ws.send(message);

    console.log(`Message sent: ${message}`);
}
