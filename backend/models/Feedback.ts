import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

export interface IFeedback extends Document {
    chatType: 'bot' | 'live_chat';
    rating: number;
    comment?: string;
    sessionId?: string; // For live chats
    user: mongoose.Types.ObjectId | IUser;
}

const FeedbackSchema: Schema = new Schema({
    chatType: { type: String, enum: ['bot', 'live_chat'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    sessionId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;