import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Service from './models/Service';
import { exit, argv } from 'process';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log('MongoDB Connected for seeding...');
  } catch (err: any) {
    console.error(err.message);
    exit(1);
  }
};

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});

    // Create users
    const createdUsers = await User.insertMany([
        {
            name: 'Admin User',
            email: 'admin@apexnucleus.com',
            password: 'admin123',
            phone: '1234567890',
            address: '123 Admin St',
            role: 'admin',
        },
        {
            name: 'Alice Johnson',
            email: 'user@apexnucleus.com',
            password: 'user123',
            phone: '0987654321',
            address: '456 User Ave',
            role: 'user',
        },
        {
            name: 'Bob Williams',
            email: 'bob@example.com',
            password: 'user123',
            phone: '5555555555',
            address: '789 Bob Blvd',
            role: 'user',
        },
    ]);
    
    const adminUser = createdUsers.find(u => u.role === 'admin')!;
    const regularUser = createdUsers.find(u => u.email === 'user@apexnucleus.com')!;
    
    // Create services for 'Alice Johnson'
    const userServices = [
      { user: regularUser._id, planName: 'Business Hosting', status: 'active' as const, renewalDate: new Date('2024-12-01'), price: 59 },
      { user: regularUser._id, planName: 'apex-website.com Domain', status: 'active' as const, renewalDate: new Date('2024-11-15'), price: 15 },
      { user: regularUser._id, planName: 'Starter Hosting', status: 'cancelled' as const, renewalDate: new Date('2023-01-20'), price: 29 },
    ];

    await Service.insertMany(userServices);

    console.log('Database seeded successfully!');
    exit();
  } catch (error) {
    console.error('Error with data import:', error);
    exit(1);
  }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Service.deleteMany();
        console.log('Data Destroyed!');
        exit();
    } catch (error) {
        console.error('Error with data destruction:', error);
        exit(1);
    }
};

const run = async () => {
    await connectDB();
    if (argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
}

run();