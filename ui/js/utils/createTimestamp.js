export function createTimestamp(date = new Date()) {
    //[] = use my system default locale
    const time = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
            
    const timestamp = document.createElement("span");
    timestamp.setAttribute("slot", "timestamp");
    timestamp.textContent = time;
    return timestamp;
}