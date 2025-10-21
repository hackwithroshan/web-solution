import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    type: 'announcement' | 'billing' | 'support' | 'service';
    title: string;
    message: string;
    isRead: boolean;
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['announcement', 'billing', 'support', 'service'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;