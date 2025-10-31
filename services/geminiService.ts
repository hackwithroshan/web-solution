import { ChatMessage } from '../types';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

/**
 * Gets a response from the chatbot backend service.
 * @param message The user's current message.
 * @param history The previous chat messages for context.
 * @param attachment An optional file (image) to send.
 * @returns A promise that resolves to the bot's string response.
 */
export const getChatbotResponse = async (message: string, history: ChatMessage[], attachment: File | null = null): Promise<string> => {
  try {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('message', message);
    formData.append('history', JSON.stringify(history));
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        // Content-Type is set automatically by the browser for FormData
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
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