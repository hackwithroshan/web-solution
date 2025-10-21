import mongoose, { Document } from 'mongoose';
import { IUser } from './User.js';

export interface IService extends Document {
    user: mongoose.Types.ObjectId | IUser;
    planName: string;
    status: 'active' | 'cancelled' | 'pending';
    startDate: Date;
    renewalDate: Date;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    planName: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['active', 'cancelled', 'pending'],
        default: 'pending'
    },
    startDate: { type: Date, default: Date.now },
    renewalDate: { type: Date, required: true },
    price: { type: Number, required: true }
}, {
    timestamps: true
});

const Service = mongoose.model<IService>('Service', serviceSchema);
export default Service;