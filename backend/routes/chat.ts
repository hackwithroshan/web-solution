import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize the Gemini AI client
if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set for Gemini. Chatbot will not work.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// This route is protected to ensure only logged-in users can use the chatbot
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;

    if (!process.env.API_KEY) {
        return next(new ApiError(500, "The chatbot is not configured on the server."));
    }
    
    if (!message) {
        return next(new ApiError(400, 'A message is required.'));
    }

    try {
        // Simple text-only generation
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User question: ${message}`,
            config: {
                systemInstruction: "You are a helpful customer support assistant for a web services company called ApexNucleus. Answer user questions concisely based on their provided message history and the current question. Keep responses friendly and professional."
            }
        });

        res.json({ response: response.text });

    } catch (error) {
        console.error("Gemini API error:", error);
        next(new ApiError(500, 'Failed to get a response from the AI model.'));
    }
});

export default router;
