import { ChatMessage } from '../types';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

/**
 * Gets a response from the chatbot backend service.
 * @param message The user's current message.
 * @param history The previous chat messages for context.
 * @returns A promise that resolves to the bot's string response.
 */
export const getChatbotResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get response from the chatbot.');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Chatbot service error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};
