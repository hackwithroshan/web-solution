import { AdminStats, User, UserService, AdminService, ServicePlan, ServiceCategory, Payment, Ticket, Message, TicketStatus, UserRole, TicketPriority, FAQ, Notification, Announcement, ChatbotKnowledge } from '../types';
import { AuthorizationError } from './errors';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Authorization': token ? `Bearer ${token}` : '',
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Create a custom event for authorization errors to be handled globally
const authErrorEvent = new Event('auth-error');

const handleResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    // Dispatch a global event so the app can react (e.g., call logout)
    window.dispatchEvent(authErrorEvent);
    
    // Also throw an error so individual api calls can catch it and stop loaders, etc.
    throw new AuthorizationError('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.statusText} (${response.status})`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // Response was not JSON, use status text as fallback
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Config API
export const fetchPublicKeys = async (): Promise<{ razorpayKeyId: string }> => {
    const response = await fetch(`${API_URL}/api/config/keys`);
    return handleResponse(response);
};

// Admin API
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const response = await fetch(`${API_URL}/api/admin/stats`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/api/admin/users`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const fetchAllServices = async (): Promise<AdminService[]> => {
  const response = await fetch(`${API_URL}/api/admin/services`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const fetchServiceById = async (id: string): Promise<AdminService> => {
    const response = await fetch(`${API_URL}/api/admin/services/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const updateService = async (id: string, data: { status?: 'active' | 'cancelled' | 'pending'; renewalDate?: string }): Promise<AdminService> => {
    const response = await fetch(`${API_URL}/api/admin/services/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Admin User Management
export const fetchUserById = async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const updateUser = async (id: string, data: { name?: string; email?: string; role?: UserRole; status?: 'active' | 'inactive' }): Promise<User> => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};


export const adminCreateUser = async (userData: any): Promise<User> => {
    const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const adminAddServiceToUser = async (userId: string, serviceData: any): Promise<UserService> => {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/services`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
};

export const adminFetchUserServices = async (userId: string): Promise<UserService[]> => {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/services`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const adminUpdateUserService = async (userId: string, serviceId: string, serviceData: any): Promise<UserService> => {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/services/${serviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
};

export const adminDeleteUserService = async (userId: string, serviceId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/services/${serviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};


// User API
export const fetchUserServices = async (userId: string): Promise<UserService[]> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/services`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const fetchPaymentHistory = async (userId: string): Promise<Payment[]> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/payments`, { headers: getAuthHeaders() });
  return handleResponse(response);
}

export const updateUserProfile = async (data: { name?: string; email?: string; phone?: string; address?: string; companyName?: string; gstNumber?: string; }): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const updateUserPassword = async (data: { currentPassword?: string; newPassword?: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/users/profile/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Two-Factor Authentication API
export const generateTwoFactorSecret = async (): Promise<{ secret: string; qrCodeUrl: string }> => {
  const response = await fetch(`${API_URL}/api/users/profile/2fa/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const enableTwoFactor = async (token: string): Promise<{ recoveryCodes: string[] }> => {
  const response = await fetch(`${API_URL}/api/users/profile/2fa/enable`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

export const disableTwoFactor = async (password: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/users/profile/2fa/disable`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password, token }),
    });
    return handleResponse(response);
};



// Public/User-Facing Service Plan API
export const fetchServicePlans = async (filters: any = {}): Promise<ServicePlan[]> => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/service-plans?${query}`);
    return handleResponse(response);
};

export const fetchCategories = async (): Promise<ServiceCategory[]> => {
    const response = await fetch(`${API_URL}/api/service-plans/categories`);
    return handleResponse(response);
};


// Admin Management API for Service Plans and Categories
export const createServicePlan = async (planData: Omit<ServicePlan, '_id' | 'category'> & { category: string }): Promise<ServicePlan> => {
    const response = await fetch(`${API_URL}/api/admin/service-plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData),
    });
    return handleResponse(response);
}

export const updateServicePlan = async (id: string, planData: Partial<Omit<ServicePlan, '_id' | 'category'> & { category: string }>): Promise<ServicePlan> => {
    const response = await fetch(`${API_URL}/api/admin/service-plans/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData),
    });
    return handleResponse(response);
}

export const deleteServicePlan = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/admin/service-plans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export const fetchAdminServicePlans = async (): Promise<ServicePlan[]> => {
    const response = await fetch(`${API_URL}/api/admin/service-plans`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const createCategory = async (name: string): Promise<ServiceCategory> => {
    const response = await fetch(`${API_URL}/api/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
}

export const updateCategory = async (id: string, name: string): Promise<ServiceCategory> => {
    const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
}

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Support Ticket System API
// User fetching their own tickets
export const fetchUserTickets = async (): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/api/tickets`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// Admin fetching all tickets
export const fetchAllTickets = async (): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/api/tickets/all`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// Get a single ticket by ID (for both user and admin)
export const fetchTicketById = async (id: string): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/api/tickets/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// Create a new ticket
export const createTicket = async (subject: string, message: string): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subject, message }),
    });
    return handleResponse(response);
};

// Send a message in a ticket
export const sendTicketMessage = async (id: string, text: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
    });
    return handleResponse(response);
};

// Upload an attachment to a ticket
export const uploadAttachment = async (id: string, file: File): Promise<Message> => {
    const formData = new FormData();
    formData.append('attachment', file);
    const response = await fetch(`${API_URL}/api/tickets/${id}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(true), // Use multipart/form-data headers
        body: formData,
    });
    return handleResponse(response);
};

// Admin-only: Update ticket status or assign to agent
export const updateTicket = async (id: string, data: { status?: TicketStatus; assignedTo?: string; priority?: TicketPriority }): Promise<Ticket> => {
    const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Admin-only: Fetch users with 'support' or 'admin' role
export const fetchSupportTeam = async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/api/admin/team`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// FAQ Management API
export const fetchAdminFAQs = async (): Promise<FAQ[]> => {
    const response = await fetch(`${API_URL}/api/faqs/admin`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const createFAQ = async (faqData: Omit<FAQ, '_id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> => {
    const response = await fetch(`${API_URL}/api/faqs/admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(faqData),
    });
    return handleResponse(response);
};

export const updateFAQ = async (id: string, faqData: Partial<Omit<FAQ, '_id' | 'createdAt' | 'updatedAt'>>): Promise<FAQ> => {
    const response = await fetch(`${API_URL}/api/faqs/admin/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(faqData),
    });
    return handleResponse(response);
};

export const deleteFAQ = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/faqs/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Chatbot Knowledge API (Admin)
export const fetchChatbotKnowledge = async (): Promise<ChatbotKnowledge[]> => {
    const response = await fetch(`${API_URL}/api/admin/chatbot/knowledge`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const createChatbotKnowledge = async (data: Omit<ChatbotKnowledge, '_id'>): Promise<ChatbotKnowledge> => {
    const response = await fetch(`${API_URL}/api/admin/chatbot/knowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateChatbotKnowledge = async (id: string, data: Partial<Omit<ChatbotKnowledge, '_id'>>): Promise<ChatbotKnowledge> => {
    const response = await fetch(`${API_URL}/api/admin/chatbot/knowledge/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteChatbotKnowledge = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/admin/chatbot/knowledge/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

// Notification API
export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_URL}/api/notifications`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const markNotificationAsRead = async (id: string): Promise<Notification> => {
    const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

// Announcement API (Admin)
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch(`${API_URL}/api/announcements`, { headers: getAuthHeaders() });
  return handleResponse(response);
};

export const createAnnouncement = async (title: string, message: string): Promise<Announcement> => {
    const response = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, message }),
    });
    return handleResponse(response);
};


// Payment API
export const createCartOrder = async (planIds: string[]): Promise<any> => {
    const response = await fetch(`${API_URL}/api/payment/create-cart-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ planIds }),
    });
    return handleResponse(response);
};

export const verifyCartPayment = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
}): Promise<{ success: boolean; message: string }> => {
     const response = await fetch(`${API_URL}/api/payment/verify-cart-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const createBulkRenewalOrder = async (serviceIds: string[]): Promise<any> => {
    const response = await fetch(`${API_URL}/api/payment/create-renewal-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ serviceIds }),
    });
    return handleResponse(response);
};

export const verifyBulkRenewalPayment = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
}): Promise<{ success: boolean; message: string }> => {
     const response = await fetch(`${API_URL}/api/payment/verify-renewal-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};
