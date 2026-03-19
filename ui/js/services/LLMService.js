// Sets the LLM for the ai agent to use.

/**
 * POST /models/set
 * Body: { model: <string|number> }
 *
 * Backend route is defined in server/main.py as:
 *   @app.post("models/set")  (handled as /models/set)
 */
export async function setLLMModel(model) {
  const url = "/models/set";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(`Failed to set LLM model: ${res.status} ${res.statusText} ${bodyText}`.trim());
  }

  // If server returns JSON, return it; otherwise return plain text.
  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

