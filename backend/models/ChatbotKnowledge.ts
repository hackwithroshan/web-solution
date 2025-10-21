import mongoose, { Document, Schema } from 'mongoose';

export interface IChatbotKnowledge extends Document {
    question: string;
    answer: string;
    keywords: string[];
}

const ChatbotKnowledgeSchema: Schema = new Schema({
    question: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
    },
    answer: { 
        type: String, 
        required: true 
    },
    keywords: [{ 
        type: String,
        trim: true,
        lowercase: true,
    }],
}, {
    timestamps: true
});

const ChatbotKnowledge = mongoose.model<IChatbotKnowledge>('ChatbotKnowledge', ChatbotKnowledgeSchema);
export default ChatbotKnowledge;
