import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    transactionId: string;
    date: Date;
}

const PaymentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    transactionId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;