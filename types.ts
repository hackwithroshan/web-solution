import { ReactNode } from "react";

export interface Service {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot'
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  id: string;
}

// New types for dashboards
export type UserRole = 'admin' | 'user' | 'support';

export interface User {
  _id: string;
  id: string; // for compatibility if used elsewhere
  name: string;
  email: string;
  phone: string;
  address: string;
  companyName?: string;
  gstNumber?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
}

export interface UserService {
  _id:string;
  planName: string;
  status: 'active' | 'cancelled' | 'pending';
  startDate: string;
  renewalDate: string;
  price: number;
  user: string; // User ID
}

export interface AdminService extends Omit<UserService, 'user'> {
  user: {
    _id: string;
    name: string;
    email: string;
  }
}

export interface MonthlyDataPoint {
    month: string;
    value: number;
}

export interface TicketStats {
    open: number;
    in_progress: number;
    closed: number;
}

export interface RecentActivity {
    type: 'new_user' | 'new_service';
    text: string;
    date: string;
}

export interface AdminStats {
  totalUsers: number;
  activeServices: number;
  monthlyRevenue: number;
  userGrowthData: MonthlyDataPoint[];
  revenueTrendData: MonthlyDataPoint[];
  ticketStats: TicketStats;
  recentActivities: RecentActivity[];
}

// Types for dynamic, admin-managed service plans
export interface ServiceCategory {
  _id: string;
  name: string;
}

export interface ServicePlan {
  _id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  priceUnit: '/year' | '/project' | '/month';
  description: string;
  keyFeatures: string[];
  tags: string[];
}

export interface Payment {
  _id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  order: Order; // Changed from string to Order for populated data
  transactionId: string;
}

// Types for Support Ticket System
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Message {
  _id: string;
  sender: User;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  createdAt: string;
}

export interface Ticket {
  _id: string;
  user: User;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: Message[];
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

// Type for FAQ Management
export interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

// Type for Chatbot Knowledge Base
export interface ChatbotKnowledge {
  _id: string;
  question: string;
  answer: string;
  keywords: string[];
}

// Types for Cart and Order System
export interface CartItem {
    plan: ServicePlan;
    quantity: number;
}

export type OrderItemType = 'new_purchase' | 'renewal';

export interface OrderItem {
    plan?: ServicePlan; // For new purchases
    service?: UserService; // For renewals
    itemType: OrderItemType;
    price: number;
}

export interface Order {
    _id: string;
    user: User;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'completed' | 'failed';
    razorpayOrderId: string;
    createdAt: string;
}

// Type for Notification System
export interface Notification {
  _id: string;
  user: string; // User ID
  type: 'announcement' | 'billing' | 'support' | 'service';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Type for Announcement System
export interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}
