import mongoose, { Document, Schema } from 'mongoose';
import { IServicePlan } from './ServicePlan.js';
import { IService } from './Service.js';
import { IUser } from './User.js';

export type OrderItemType = 'new_purchase' | 'renewal';

export interface IOrderItem {
    plan?: mongoose.Types.ObjectId | IServicePlan;
    service?: mongoose.Types.ObjectId | IService;
    itemType: OrderItemType;
    price: number;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId | IUser;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'completed' | 'failed';
    razorpayOrderId?: string;
}

const OrderItemSchema: Schema = new Schema({
    plan: { type: Schema.Types.ObjectId, ref: 'ServicePlan' },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    itemType: { type: String, enum: ['new_purchase', 'renewal'], required: true },
    price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String },
}, {
    timestamps: true
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;