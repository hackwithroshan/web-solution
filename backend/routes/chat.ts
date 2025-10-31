import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fs from 'fs';

const router = express.Router();

// Initialize the Gemini AI client
if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set for Gemini. Chatbot will not work.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// This route is protected to ensure only logged-in users can use the chatbot
// FIX: Add explicit Request, Response, and NextFunction types to resolve overload error.
router.post('/', protect, upload.single('attachment'), async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;
    // const history = req.body.history ? JSON.parse(req.body.history) : [];

    if (!process.env.API_KEY) {
        return next(new ApiError(500, "The chatbot is not configured on the server."));
    }
    
    if (!message && !req.file) {
        return next(new ApiError(400, 'A message or attachment is required.'));
    }

    try {
        const parts: any[] = [];

        // Handle text part
        let prompt = message;
        if (!prompt && req.file) {
            prompt = "What's in this image?";
        }
        parts.push({ text: prompt });

        // Handle image part
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                 fs.unlinkSync(req.file.path); // Clean up non-image file
                return next(new ApiError(400, 'Only image files are supported for attachments.'));
            }

            const imagePart = {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: fs.readFileSync(req.file.path).toString('base64'),
                },
            };
            parts.push(imagePart);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts }],
            config: {
                systemInstruction: "You are a helpful customer support assistant for a web services company called ApexNucleus. Answer user questions concisely. If an image is provided, describe it or answer any questions about it in the context of customer support."
            }
        });

        // Clean up uploaded file from /tmp
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.json({ response: response.text });

    } catch (error) {
        // Clean up file on error too
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if(err) console.error("Error deleting temp file after API error:", err);
            });
        }
        console.error("Gemini API error:", error);
        next(new ApiError(500, 'Failed to get a response from the AI model.'));
    }
});

export default router;