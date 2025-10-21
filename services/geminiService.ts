import { ChatMessage } from '../types';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

/**
 * Streams a response from the backend's Gemini chat proxy.
 * @param message The user's message.
 * @param history The current chat history to provide context.
 * @returns A ReadableStreamDefaultReader to consume the streaming response.
 */
export const streamMessageFromBackend = async (message: string, history: ChatMessage[]): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    console.error("Error from backend chat stream:", errorText);
    throw new Error("Failed to get response from the support bot.");
  }

  return response.body.getReader();
};