const ws = new WebSocket("ws://127.0.0.1:8000/ws");

ws.onopen = () => {
    console.log("Connected to WebSocket");
};

ws.onmessage = (event) => {
    const messages = document.getElementById("messages");
    const li = document.createElement("li");
    li.textContent = event.data;
    messages.appendChild(li);
};
function sendMessage() {
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;
  ws.send(input.value);
  console.log(`Message sent: ${input.value}`);
  input.value = "";
}

