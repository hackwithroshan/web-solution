import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
    question: string;
    answer: string;
    category: string;
}

const FAQSchema: Schema = new Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, required: true, trim: true },
}, {
    timestamps: true
});

const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
export default FAQ;
