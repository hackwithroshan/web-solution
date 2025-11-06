import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailSubscriber extends Document {
    email: string;
}

const EmailSubscriberSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
}, {
    timestamps: true
});

const EmailSubscriber = mongoose.model<IEmailSubscriber>('EmailSubscriber', EmailSubscriberSchema);

export default EmailSubscriber;
