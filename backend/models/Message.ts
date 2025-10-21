import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

export interface IMessage extends Document {
    ticket: mongoose.Types.ObjectId;
    sender: IUser;
    text: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'file';
}

const MessageSchema: Schema = new Schema({
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    attachmentUrl: { type: String },
    attachmentType: { type: String, enum: ['image', 'file'] },
}, {
    timestamps: true
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;