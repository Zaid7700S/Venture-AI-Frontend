const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.error(
    'VITE_API_URL is not set in this production build — API calls will ' +
    'try to hit http://localhost:8000, which will fail for real users. ' +
    'Set VITE_API_URL in your deployment environment.'
  );
}

// Never throws itself, even if the response body isn't JSON (e.g. a raw
// 502/504 from a proxy in front of the backend) - always returns a usable message.
const safeParseErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json();
    return data.detail || data.error || fallback;
  } catch {
    return `${fallback} (server returned status ${response.status})`;
  }
};

export const generatePlan = async (businessIdea, location, budget, groqApiKey) => {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Groq-API-Key': groqApiKey // <-- SEND THE USER'S KEY HERE
    },
    body: JSON.stringify({
      business_idea: businessIdea,
      raw_location_input: location,
      budget: parseFloat(budget)
    })
  });

  if (!response.ok) {
    throw new Error(await safeParseErrorMessage(response, 'Failed to generate plan'));
  }
  
  return await response.json();
};

// Streams real progress from the backend as each agent node actually
// finishes (Server-Sent Events over POST), instead of the old one-shot
// /generate call where the UI had to guess at timing.
// `onEvent` is called for every event as it arrives:
//   { type: 'node_done', node: '<node_name>' }
//   { type: 'final', markdown: '<plan>' }
//   { type: 'error', message: '<human message>' }
// Resolves with { markdown } once the 'final' event has been received.
export const generatePlanStream = async (businessIdea, location, budget, groqApiKey, onEvent) => {
  const response = await fetch(`${API_URL}/generate/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Groq-API-Key': groqApiKey
    },
    body: JSON.stringify({
      business_idea: businessIdea,
      raw_location_input: location,
      budget: parseFloat(budget)
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(await safeParseErrorMessage(response, 'Failed to generate plan'));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const rawFrame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const dataLine = rawFrame.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      const jsonStr = dataLine.slice(5).trim();
      if (!jsonStr) continue;

      let evt;
      try {
        evt = JSON.parse(jsonStr);
      } catch {
        continue; // skip malformed frame rather than killing the whole stream
      }

      if (evt.type === 'error') {
        throw new Error(evt.message || 'Plan generation failed.');
      }
      if (evt.type === 'final') {
        finalResult = { markdown: evt.markdown };
      }
      onEvent?.(evt);
    }
  }

  if (!finalResult) {
    throw new Error('Connection closed before the plan finished generating.');
  }
  return finalResult;
};

// Render's free tier spins the backend down after idling and takes ~30-60s
// to cold-start on the next request. Polls /health until it responds (or we
// give up), calling onWaking(true/false) so the UI can show a "server is
// starting" message - but only if the wait is actually noticeable, so a
// warm server never flashes the banner.
export const wakeServer = async (onWaking, { maxWaitMs = 90000, showAfterMs = 1200 } = {}) => {
  const start = Date.now();
  let shownWaking = false;
  const showTimer = setTimeout(() => {
    shownWaking = true;
    onWaking?.(true);
  }, showAfterMs);

  const stopShowing = () => {
    clearTimeout(showTimer);
    if (shownWaking) onWaking?.(false);
  };

  while (Date.now() - start < maxWaitMs) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_URL}/health`, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        stopShowing();
        return true;
      }
    } catch {
      // Server likely still cold-starting - fall through and retry.
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  stopShowing();
  return false; // Gave up waiting; caller still attempts the real request.
};

export const chatWithPlan = async (planMarkdown, userMessage, chatHistory, groqApiKey) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Groq-API-Key': groqApiKey // <-- SEND THE USER'S KEY HERE
    },
    body: JSON.stringify({
      plan_markdown: planMarkdown,
      user_message: userMessage,
      chat_history: chatHistory
    })
  });

  if (!response.ok) {
    throw new Error(await safeParseErrorMessage(response, 'Chat failed'));
  }
  const data = await response.json();
  return data.response;
};