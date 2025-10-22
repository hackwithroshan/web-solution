import { User, AdminService, ServicePlan, ServiceCategory, UserService, Payment, Ticket, Message, AdminStats, UserRole, FAQ, ChatbotKnowledge, Notification, Announcement } from '../types';

// The API_URL is determined based on the hostname.
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

/**
 * Custom error class for handling authorization-related (401/403) HTTP responses.
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * A wrapper for the native fetch API that centralizes API calls.
 * It automatically includes the JWT token in the headers and handles
 * standard error responses, including dispatching a global event for
 * authorization errors.
 * @param url The API endpoint to call.
 * @param options The standard fetch options (method, body, etc.).
 * @returns A promise that resolves to the JSON response.
 */
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Dispatch a global event that the App component listens for to trigger logout.
    window.dispatchEvent(new CustomEvent('auth-error'));
    throw new AuthorizationError('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred.');
  }
  
  // Handle empty responses (e.g., from a 204 No Content status)
  if (response.headers.get('Content-Length') === '0' || response.status === 204) {
      return null;
  }
  
  return response.json();
};

// --- Auth ---
export const sendRegistrationOtp = (email: string): Promise<{ message: string }> => apiFetch('/api/auth/send-verification-otp', { method: 'POST', body: JSON.stringify({ email }) });


// --- Website Performance ---
export const analyzeWebsitePerformance = (url: string): Promise<any> => apiFetch('/api/performance/analyze', { method: 'POST', body: JSON.stringify({ url }) });

// --- User & Service Management ---
export const fetchUserServices = (userId: string): Promise<UserService[]> => apiFetch(`/api/users/${userId}/services`);
export const fetchPaymentHistory = (userId: string): Promise<Payment[]> => apiFetch(`/api/users/${userId}/payments`);
export const updateUserProfile = (profileData: Partial<User>): Promise<User> => apiFetch('/api/users/profile', { method: 'PUT', body: JSON.stringify(profileData) });
export const updateUserPassword = (passwordData: object): Promise<{ message: string }> => apiFetch('/api/users/profile/password', { method: 'PUT', body: JSON.stringify(passwordData) });

// --- Service Plans & Categories (Public) ---
export const fetchServicePlans = (): Promise<ServicePlan[]> => apiFetch('/api/service-plans');
export const fetchCategories = (): Promise<ServiceCategory[]> => apiFetch('/api/service-plans/categories');

// --- Payment & Checkout ---
export const fetchPublicKeys = (): Promise<{ razorpayKeyId: string }> => apiFetch('/api/config/keys');
export const createCartOrder = (planIds: string[]): Promise<{ orderId: string, razorpayOrder: any }> => apiFetch('/api/payment/create-cart-order', { method: 'POST', body: JSON.stringify({ planIds }) });
export const verifyCartPayment = (verificationData: object): Promise<any> => apiFetch('/api/payment/verify-cart-payment', { method: 'POST', body: JSON.stringify(verificationData) });
export const createBulkRenewalOrder = (serviceIds: string[]): Promise<{ orderId: string, razorpayOrder: any }> => apiFetch('/api/payment/create-renewal-order', { method: 'POST', body: JSON.stringify({ serviceIds }) });
export const verifyBulkRenewalPayment = (verificationData: object): Promise<any> => apiFetch('/api/payment/verify-renewal-payment', { method: 'POST', body: JSON.stringify(verificationData) });

// --- Admin-Specific ---
export const fetchAdminStats = (): Promise<AdminStats> => apiFetch('/api/admin/stats');
export const fetchAllServices = (): Promise<AdminService[]> => apiFetch('/api/admin/services');
export const fetchUsers = (): Promise<User[]> => apiFetch('/api/admin/users');
export const adminCreateUser = (userData: { name: string, email: string, password: string, role: UserRole }): Promise<User> => apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(userData) });
export const fetchUserById = (userId: string): Promise<User> => apiFetch(`/api/admin/users/${userId}`);
export const updateUser = (userId: string, userData: Partial<User>): Promise<User> => apiFetch(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
export const deleteUser = (userId: string): Promise<{ message: string }> => apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
export const adminFetchUserServices = (userId: string): Promise<UserService[]> => apiFetch(`/api/admin/users/${userId}/services`);
export const adminAddServiceToUser = (userId: string, serviceData: object): Promise<UserService> => apiFetch(`/api/admin/users/${userId}/services`, { method: 'POST', body: JSON.stringify(serviceData) });
export const adminDeleteUserService = (userId: string, serviceId: string): Promise<{ message: string }> => apiFetch(`/api/admin/users/${userId}/services/${serviceId}`, { method: 'DELETE' });

// Admin Service & Plan Management
export const fetchAdminServicePlans = (): Promise<ServicePlan[]> => apiFetch('/api/admin/service-plans');
export const createServicePlan = (planData: object): Promise<ServicePlan> => apiFetch('/api/admin/service-plans', { method: 'POST', body: JSON.stringify(planData) });
export const updateServicePlan = (planId: string, planData: object): Promise<ServicePlan> => apiFetch(`/api/admin/service-plans/${planId}`, { method: 'PUT', body: JSON.stringify(planData) });
export const deleteServicePlan = (planId: string): Promise<{ message: string }> => apiFetch(`/api/admin/service-plans/${planId}`, { method: 'DELETE' });

export const fetchServiceById = (serviceId: string): Promise<AdminService> => apiFetch(`/api/admin/services/${serviceId}`);
export const updateService = (serviceId: string, serviceData: { status?: string, renewalDate?: string }): Promise<AdminService> => apiFetch(`/api/admin/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(serviceData) });

// Admin Category Management
export const createCategory = (name: string): Promise<ServiceCategory> => apiFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name }) });
export const updateCategory = (categoryId: string, name: string): Promise<ServiceCategory> => apiFetch(`/api/admin/categories/${categoryId}`, { method: 'PUT', body: JSON.stringify({ name }) });
export const deleteCategory = (categoryId: string): Promise<{ message: string }> => apiFetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });

// --- Support Tickets ---
export const fetchUserTickets = (): Promise<Ticket[]> => apiFetch('/api/tickets');
export const fetchAllTickets = (): Promise<Ticket[]> => apiFetch('/api/tickets/all');
export const fetchTicketById = (ticketId: string): Promise<Ticket> => apiFetch(`/api/tickets/${ticketId}`);
export const createTicket = (subject: string, message: string): Promise<Ticket> => apiFetch('/api/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) });
export const sendTicketMessage = (ticketId: string, text: string): Promise<Message> => apiFetch(`/api/tickets/${ticketId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
export const updateTicket = (ticketId: string, data: object): Promise<Ticket> => apiFetch(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify(data) });
export const fetchSupportTeam = (): Promise<User[]> => apiFetch('/api/admin/team');
export const requestCallback = (phone: string, message: string): Promise<{ message: string }> => apiFetch('/api/tickets/request-callback', { method: 'POST', body: JSON.stringify({ phone, message }) });


// Ticket Attachments
export const uploadAttachment = async (ticketId: string, file: File, text?: string): Promise<Message> => {
    const formData = new FormData();
    formData.append('attachment', file);
    if (text) {
        formData.append('text', text);
    }

    // apiFetch is not used here because we are sending FormData, not JSON.
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/api/tickets/${ticketId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
    }

    return response.json();
};

// --- 2FA ---
export const generateTwoFactorSecret = (): Promise<{ secret: string, qrCodeUrl: string }> => apiFetch('/api/users/profile/2fa/generate', { method: 'POST' });
export const enableTwoFactor = (token: string): Promise<{ recoveryCodes: string[] }> => apiFetch('/api/users/profile/2fa/enable', { method: 'POST', body: JSON.stringify({ token }) });
export const disableTwoFactor = (password: string, token: string): Promise<{ message: string }> => apiFetch('/api/users/profile/2fa/disable', { method: 'POST', body: JSON.stringify({ password, token }) });

// --- FAQs ---
export const fetchAdminFAQs = (): Promise<FAQ[]> => apiFetch('/api/admin/faqs');
export const fetchPublicFAQs = (): Promise<FAQ[]> => apiFetch('/api/faqs/public');
export const createFAQ = (faqData: object): Promise<FAQ> => apiFetch('/api/admin/faqs', { method: 'POST', body: JSON.stringify(faqData) });
export const updateFAQ = (id: string, faqData: object): Promise<FAQ> => apiFetch(`/api/admin/faqs/${id}`, { method: 'PUT', body: JSON.stringify(faqData) });
export const deleteFAQ = (id: string): Promise<{ message: string }> => apiFetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });

// --- Chatbot Knowledge ---
export const fetchChatbotKnowledge = (): Promise<ChatbotKnowledge[]> => apiFetch('/api/admin/chatbot/knowledge');
export const createChatbotKnowledge = (data: Omit<ChatbotKnowledge, '_id'>): Promise<ChatbotKnowledge> => apiFetch('/api/admin/chatbot/knowledge', { method: 'POST', body: JSON.stringify(data) });
export const updateChatbotKnowledge = (id: string, data: object): Promise<ChatbotKnowledge> => apiFetch(`/api/admin/chatbot/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteChatbotKnowledge = (id: string): Promise<{ message: string }> => apiFetch(`/api/admin/chatbot/knowledge/${id}`, { method: 'DELETE' });

// --- Notifications ---
export const fetchNotifications = (): Promise<Notification[]> => apiFetch('/api/notifications');
export const markNotificationAsRead = (id: string): Promise<Notification> => apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
export const markAllNotificationsAsRead = (): Promise<{ message: string }> => apiFetch('/api/notifications/read-all', { method: 'PUT' });

// --- Announcements ---
export const fetchAnnouncements = (): Promise<Announcement[]> => apiFetch('/api/admin/announcements');
export const createAnnouncement = (title: string, message: string): Promise<Announcement> => apiFetch('/api/admin/announcements', { method: 'POST', body: JSON.stringify({ title, message }) });