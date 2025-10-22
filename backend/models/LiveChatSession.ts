import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

interface IChatMessage {
    id: string;
    sender: 'user' | 'bot'; // 'bot' represents the agent
    text: string;
    timestamp: string;
}

export interface ILiveChatSession extends Document {
    user: {
        _id: mongoose.Types.ObjectId | IUser;
        name: string;
    };
    userSocketId: string;
    adminSocketId?: string;
    status: 'waiting' | 'active' | 'closed';
    history: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
    id: { type: String, required: true },
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
}, { _id: false });

const LiveChatSessionSchema: Schema = new Schema({
    user: {
        _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
    },
    userSocketId: { type: String, required: true, index: true },
    adminSocketId: { type: String, index: true },
    status: {
        type: String,
        enum: ['waiting', 'active', 'closed'],
        default: 'waiting',
        index: true,
    },
    history: [ChatMessageSchema],
}, {
    timestamps: true
});

const LiveChatSession = mongoose.model<ILiveChatSession>('LiveChatSession', LiveChatSessionSchema);

export default LiveChatSession;