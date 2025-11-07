import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category.js';

export interface IPlanTier {
    name: 'Starter' | 'Professional' | 'Enterprise';
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isPopular: boolean;
}

export interface IServicePlan extends Document {
    name: string;
    category: ICategory['_id'];
    description: string;
    plans: IPlanTier[];
    tags: string[];
}

const PlanTierSchema: Schema = new Schema({
    name: { type: String, enum: ['Starter', 'Professional', 'Enterprise'], required: true },
    monthlyPrice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
}, { _id: false });


const ServicePlanSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    plans: [PlanTierSchema],
    tags: [{ type: String }],
}, {
    timestamps: true
});

const ServicePlan = mongoose.model<IServicePlan>('ServicePlan', ServicePlanSchema);
export default ServicePlan;