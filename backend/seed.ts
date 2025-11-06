import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';
import ServicePlan from './models/ServicePlan.js';
import Payment from './models/Payment.js';
import Notification from './models/Notification.js';
import Announcement from './models/Announcement.js';
// FIX: Import process to resolve typing issues.
import process from 'process';
import crypto from 'crypto';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log('MongoDB Connected for seeding...');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await ServicePlan.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Announcement.deleteMany({});

    // Create users
    const createdUsers = await User.insertMany([
        {
            name: 'Admin User',
            email: 'admin@apexnucleus.com',
            password: 'admin123',
            role: 'admin',
            phone: '1234567890',
            address: '123 Admin Street, Admin City, 10001',
        },
        {
            name: 'Alice Johnson',
            email: 'user@apexnucleus.com',
            password: 'user123',
            role: 'user',
            phone: '0987654321',
            address: '456 User Avenue, User Town, 20002',
        },
    ]);
    
    const regularUser = createdUsers.find(u => u.email === 'user@apexnucleus.com')!;

    // Create services for 'Alice Johnson' with dynamic dates
    const servicesToCreate = [
      { user: regularUser._id, planName: 'Business Hosting', status: 'active' as const, renewalDate: new Date(new Date().setDate(new Date().getDate() + 45)), price: 59 },
      { user: regularUser._id, planName: 'apex-website.com Domain', status: 'active' as const, renewalDate: new Date(new Date().setDate(new Date().getDate() + 25)), price: 15 },
      { user: regularUser._id, planName: 'Managed Security', status: 'active' as const, renewalDate: new Date(new Date().setDate(new Date().getDate() + 6)), price: 49 },
      { user: regularUser._id, planName: 'AI Development Package', status: 'active' as const, renewalDate: new Date(new Date().setDate(new Date().getDate() - 10)), price: 250 },
      { user: regularUser._id, planName: 'Podcast Studio Rental', status: 'active' as const, renewalDate: new Date(), price: 100 }, // Expires today
      { user: regularUser._id, planName: 'Starter Hosting', status: 'cancelled' as const, renewalDate: new Date('2024-01-20'), price: 29 },
    ];
    const createdServices = await Service.insertMany(servicesToCreate);

    // Create payments for 'Alice Johnson'
    const paymentsToCreate = [
        { user: regularUser._id, order: new mongoose.Types.ObjectId(), amount: 59.00, transactionId: crypto.randomBytes(12).toString('hex'), date: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        { user: regularUser._id, order: new mongoose.Types.ObjectId(), amount: 15.00, transactionId: crypto.randomBytes(12).toString('hex'), date: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
    ];
    await Payment.insertMany(paymentsToCreate);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Service.deleteMany();
        await Category.deleteMany();
        await ServicePlan.deleteMany();
        await Payment.deleteMany();
        await Notification.deleteMany({});
        await Announcement.deleteMany({});
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error('Error with data destruction:', error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
}

run();