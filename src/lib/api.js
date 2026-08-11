const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to generate plan');
  }
  
  return await response.json();
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

  if (!response.ok) throw new Error('Chat failed');
  const data = await response.json();
  return data.response;
};
