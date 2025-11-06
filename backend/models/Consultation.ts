import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultation extends Document {
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'pending' | 'contacted';
    createdAt: Date;
}

const ConsultationSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'contacted'], default: 'pending' },
}, { timestamps: true });

const Consultation = mongoose.model<IConsultation>('Consultation', ConsultationSchema);

export default Consultation;