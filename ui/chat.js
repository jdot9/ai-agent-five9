const ws = new WebSocket("ws://127.0.0.1:8000/ws");
const outputElement = document.querySelector(".output-group__answer");

ws.onopen = () => {
    console.log("Connected to WebSocket");
};

ws.onmessage = (event) => {
    const line = document.createElement("p");
    line.textContent = event.data;
    outputElement.appendChild(line);
};

function sendMessage() {
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;
  ws.send(input.value);
  console.log(`Message sent: ${input.value}`);
  input.value = "";
}

