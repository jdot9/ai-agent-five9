export function createMessage(message, messageType) {
    const userMsg = document.createElement("my-message");
    userMsg.textContent = message;
    userMsg.setAttribute(messageType, "true");
    return userMsg;
} 