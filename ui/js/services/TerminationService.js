// Terminates conversation session with Five9 Agent

// Use same-origin base URL so we don't need to hard-code ngrok tunnels.
const BASE_URL = window.location.origin;

/**
 * Triggers the backend termination flow (GET /conversations/terminate).
 * Server route is defined in server/main.py around line 76.
 */
export async function initiateTerminateConversation() {
  const url = `${BASE_URL}/conversations/terminate`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  // Surface useful error info to the caller/UI.
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Terminate request failed: ${response.status} ${response.statusText} ${bodyText}`);
  }

  // If the server returns JSON, pass it through; otherwise return text.
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}

