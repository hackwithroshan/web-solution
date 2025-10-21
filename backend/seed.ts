import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';
import ServicePlan from './models/ServicePlan.js';
import Payment from './models/Payment.js';
import Notification from './models/Notification.js';
import Announcement from './models/Announcement.js';
// FIX: Import exit and argv from process to resolve typing issues.
import { exit, argv } from 'process';
import crypto from 'crypto';

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
        { user: regularUser._id, order: new mongoose.Types.ObjectId(), amount: 59.00, transactionId: crypto.randomBytes(8).toString('hex').toUpperCase(), date: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        { user: regularUser._id, order: new mongoose.Types.ObjectId(), amount: 15.00, transactionId: crypto.randomBytes(8).toString('hex').toUpperCase(), date: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
        { user: regularUser._id, order: new mongoose.Types.ObjectId(), amount: 49.00, transactionId: crypto.randomBytes(8).toString('hex').toUpperCase(), date: new Date(new Date().setMonth(new Date().getMonth() - 3)) },
    ];
    // @ts-ignore
    await Payment.insertMany(paymentsToCreate);
    
    // Create Categories
    const categories = await Category.insertMany([
        { name: 'Domain Registration' },
        { name: 'Web Hosting' },
        { name: 'Web Development' },
        { name: 'Social Media Marketing' },
        { name: 'Podcast Studio' },
    ]);
    
    const categoryMap = categories.reduce((map, category) => {
        // Convert ObjectId to string to match the Record<string, string> type.
        map[category.name] = category._id.toString();
        return map;
    }, {} as Record<string, string>);

    // Create Service Plans
    await ServicePlan.insertMany([
      {
        name: 'Starter Hosting',
        category: categoryMap['Web Hosting'],
        price: 299,
        priceUnit: '/month',
        description: 'For small projects and personal sites.',
        keyFeatures: ['1 Website', '10GB SSD Storage', '1TB Bandwidth', 'Free SSL Certificate', '24/7 Support'],
        tags: []
      },
      {
        name: 'Business Hosting',
        category: categoryMap['Web Hosting'],
        price: 599,
        priceUnit: '/month',
        description: 'Ideal for growing businesses and professionals.',
        keyFeatures: ['10 Websites', '50GB SSD Storage', '5TB Bandwidth', 'Free SSL Certificate', 'Priority Support'],
        tags: ['featured']
      },
      {
        name: 'Enterprise Hosting',
        category: categoryMap['Web Hosting'],
        price: 999,
        priceUnit: '/month',
        description: 'Advanced solutions for large-scale applications.',
        keyFeatures: ['Unlimited Websites', '200GB SSD Storage', 'Unmetered Bandwidth', 'Advanced Security', 'Dedicated Support Agent'],
        tags: []
      },
      {
        name: 'Premium Domain Registration',
        category: categoryMap['Domain Registration'],
        price: 899,
        priceUnit: '/year',
        description: 'Secure your perfect domain name with premium registration and advanced DNS management features.',
        keyFeatures: ['Free DNS Management', 'Domain privacy protection', '24/7 Support'],
        tags: ['Popular', 'Best Value']
      },
      {
        name: 'E-commerce Website Development',
        category: categoryMap['Web Development'],
        price: 45000,
        priceUnit: '/project',
        description: 'Complete e-commerce solution with payment gateway integration, inventory management, and a mobile-ready design.',
        keyFeatures: ['Mobile-responsive design', 'Payment gateway integration', 'Inventory management'],
        tags: ['Custom Design', 'Mobile Ready']
      }
    ]);
    
    // Create notifications for 'Alice Johnson'
    const userNotifications = [
        {
            user: regularUser._id,
            type: 'billing' as const,
            title: 'Payment Successful',
            message: 'Your payment of ₹59.00 for Business Hosting has been successfully processed.',
            isRead: true,
        },
        {
            user: regularUser._id,
            type: 'announcement' as const,
            title: 'New AI Features Live!',
            message: 'We\'ve launched new AI-powered development services. Check them out in the services section.',
            isRead: false,
        },
        // RENEWAL NOTIFICATIONS
        {
            user: regularUser._id, type: 'service' as const, title: 'Renewal Reminder (30 Days)',
            message: 'Your "apex-website.com Domain" is set to expire in 25 days. Renew now to avoid service interruption.', isRead: true,
        },
        {
            user: regularUser._id, type: 'service' as const, title: 'CRITICAL: Service Expiring Soon (7 Days)',
            message: 'Your "Managed Security" plan will expire in 6 days. Immediate action is required.', isRead: false,
        },
        {
            user: regularUser._id, type: 'service' as const, title: 'URGENT: Service EXPIRED',
            message: 'Your "AI Development Package" has expired. Please renew immediately to restore service.', isRead: false,
        },
        {
            user: regularUser._id, type: 'service' as const, title: 'FINAL NOTICE: Service Expires Today',
            message: 'Your "Podcast Studio Rental" service expires today. Renew now!', isRead: false,
        }
    ];
    await Notification.insertMany(userNotifications);

    console.log('Database seeded successfully!');
    exit();
  } catch (error) {
    console.error('Error with data import:', error);
    exit(1);
  }
};

const destroyData = async () => {
    try {
        await User.deleteMany({});
        await Service.deleteMany();
        await Category.deleteMany();
        await ServicePlan.deleteMany();
        await Payment.deleteMany({});
        await Notification.deleteMany({});
        await Announcement.deleteMany({});
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