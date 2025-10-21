import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    createdBy: mongoose.Types.ObjectId | IUser;
    createdAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
