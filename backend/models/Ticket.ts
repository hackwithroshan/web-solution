import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.js';
import { IMessage } from './Message.js';

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface ITicket extends Document {
    user: IUser;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo?: IUser;
    messages: (mongoose.Types.ObjectId | IMessage)[];
    createdAt?: Date;
    updatedAt?: Date;
}

const TicketSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
}, {
    timestamps: true
});

const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
export default Ticket;