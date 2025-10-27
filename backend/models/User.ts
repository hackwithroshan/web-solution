import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Fix: Add IUser interface to include the custom matchPassword method for TypeScript type safety.
export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    companyName?: string;
    gstNumber?: string;
    role: 'user' | 'admin' | 'support';
    status: 'active' | 'inactive';
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    twoFactorRecoveryCodes?: string[];
    matchPassword(enteredPassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    companyName: { type: String },
    gstNumber: { type: String },
    role: { type: String, enum: ['user', 'admin', 'support'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorRecoveryCodes: [{ type: String }],
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model<IUser>('User', userSchema);
export default User;
