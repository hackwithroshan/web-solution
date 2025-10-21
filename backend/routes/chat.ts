import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.js';
import ChatbotKnowledge from '../models/ChatbotKnowledge.js';

const router = express.Router();

// A helper function to simulate streaming text for a better UX
const streamResponse = (res: Response, text: string) => {
    // Split text into words to stream them one by one
    const words = text.split(' ');
    let i = 0;
    const interval = setInterval(() => {
        if (i < words.length) {
            // Write the next word with a space
            res.write(words[i] + ' ');
            i++;
        } else {
            // Once all words are sent, clear the interval and end the response
            clearInterval(interval);
            res.end();
        }
    }, 50); // Delay between words in milliseconds
};

const escapeRegex = (text: string) => {
    return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

router.post('/stream', protect, async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;
    
    try {
        // First, check for explicit requests to speak to a human
        if (/human|agent|person|support/i.test(message)) {
            res.setHeader('Content-Type', 'text/plain');
            // Stream the handover message, including the special command for the frontend
            streamResponse(res, "Connecting you to a human agent... [HUMAN_HANDOVER]");
            return;
        }

        const trimmedMessage = message.trim();
        const messageKeywords = trimmedMessage.toLowerCase().split(/\s+/);

        // Find a relevant answer from the knowledge base
        const knowledge = await ChatbotKnowledge.findOne({
            $or: [
                // Prioritize an exact, case-insensitive match for the whole question
                { question: { $regex: new RegExp(`^${escapeRegex(trimmedMessage)}$`, 'i') } },
                // Fallback to matching any of the keywords from the user's message
                { keywords: { $in: messageKeywords } }
            ]
        });
        
        res.setHeader('Content-Type', 'text/plain');

        if (knowledge) {
            // If a match is found, stream the stored answer
            streamResponse(res, knowledge.answer);
        } else {
            // If no match is found, provide a helpful default response
            streamResponse(res, "I'm sorry, I don't have an answer for that. If you'd like to speak to a human agent, please type 'talk to an agent'.");
        }

    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).send("Error getting response from the support bot.");
    }
});

export default router;