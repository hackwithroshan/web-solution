import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category.js';

export interface IServicePlan extends Document {
    name: string;
    category: ICategory;
    price: number;
    priceUnit: '/year' | '/project' | '/month';
    description: string;
    keyFeatures: string[];
    tags: string[];
}

const ServicePlanSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['/year', '/project', '/month'], required: true },
    description: { type: String, required: true },
    keyFeatures: [{ type: String }],
    tags: [{ type: String }],
}, {
    timestamps: true
});

const ServicePlan = mongoose.model<IServicePlan>('ServicePlan', ServicePlanSchema);
export default ServicePlan;