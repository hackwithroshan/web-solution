import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
export default ContactMessage;