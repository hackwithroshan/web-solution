import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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

const Service = mongoose.model('Service', serviceSchema);
export default Service;