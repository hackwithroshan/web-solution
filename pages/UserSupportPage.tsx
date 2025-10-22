import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { Ticket, TicketStatus, FAQ } from '../types';
import { fetchUserTickets, createTicket, fetchPublicFAQs, requestCallback } from '../services/api';
import { Loader, Plus, MessageSquare, ChevronRight, Search, Headset, Phone, Bot, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const statusStyles = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800',
    };
    const formattedStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {formattedStatus}
        </span>
    );
};

const UserSupportPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
    const [showContactPopup, setShowContactPopup] = useState(false);
    
    // New states for callback form
    const [showCallbackForm, setShowCallbackForm] = useState(false);
    const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);
    const [callbackData, setCallbackData] = useState({ phone: user?.phone || '', message: '' });

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const [ticketData, faqData] = await Promise.all([fetchUserTickets(), fetchPublicFAQs()]);
            setTickets(ticketData);
            setFaqs(faqData);
        } catch (error: any) {
            addToast(error.message || 'Failed to fetch support data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadTickets();
        }
    }, [user]);
    
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createTicket(newTicket.subject, newTicket.message);
            addToast('Support ticket created successfully!', 'success');
            setShowCreateForm(false);
            setNewTicket({ subject: '', message: '' });
            loadTickets();
        } catch (error: any) {
             addToast(error.message || 'Failed to create ticket', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestCallback = () => {
        setShowContactPopup(false);
        setShowCallbackForm(true);
    }
    
    const handleCallbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCallback(true);
        try {
            await requestCallback(callbackData.phone, callbackData.message);
            addToast("We've received your request. Our team will call you back shortly.", "success");
            setShowCallbackForm(false);
            setCallbackData({ phone: user?.phone || '', message: '' });
        } catch (error: any) {
            addToast(error.message || 'Failed to submit request', 'error');
        } finally {
            setIsSubmittingCallback(false);
        }
    };

    const handleLiveChat = () => {
        addToast("Please use the chat widget in the bottom right for live support.", "info");
        setShowContactPopup(false);
    }
    
    const handleCreateTicketClick = () => {
        setShowCreateForm(true);
        setShowContactPopup(false);
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                         <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Support Center</h1>
                            <p className="mt-1 text-gray-600">Find answers, get help, and track your requests.</p>
                        </div>
                        
                        {/* Help Center UI */}
                        <div className="bg-white rounded-2xl shadow-sm max-w-2xl mx-auto border border-gray-200/80 mb-8">
                            <div className="bg-gray-800 text-white rounded-t-2xl p-5">
                                <h2 className="text-lg font-semibold">Help Center</h2>
                                <p className="text-sm text-gray-300">How can we help you today?</p>
                            </div>

                            <div className="p-5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" placeholder="Search for help..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                
                                <h3 className="mt-6 font-semibold text-gray-800">Popular FAQs</h3>
                                <div className="mt-3 space-y-2">
                                    {faqs.map((faq) => (
                                        <a href="#" key={faq._id} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex justify-between items-center group">
                                            <span>{faq.question}</span>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    ))}
                                </div>

                                <div className="mt-6 text-center border-t pt-5">
                                    <p className="text-gray-500 text-sm mb-2">Need more help?</p>
                                    <Button onClick={() => setShowContactPopup(true)} className="inline-flex items-center gap-2">
                                        <Headset size={18} /> Contact Us
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Contact Popup Modal */}
                        {showContactPopup && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-80 relative p-5 animate-slide-in-up">
                                    <button onClick={() => setShowContactPopup(false)} className="absolute top-3 right-3 text-gray-500 hover:text-red-500"><X size={22} /></button>
                                    <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Contact Support</h3>
                                    <div className="space-y-3">
                                        <button onClick={handleLiveChat} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition">
                                            <Headset className="text-blue-600 text-xl" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800">Live Chat</p>
                                                <p className="text-xs text-gray-500">Available 10 AM - 10 PM</p>
                                            </div>
                                        </button>
                                        <button onClick={handleRequestCallback} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition">
                                            <Phone className="text-green-600 text-xl" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800">Request a Callback</p>
                                                <p className="text-xs text-gray-500">We’ll contact you soon</p>
                                            </div>
                                        </button>
                                         <button onClick={handleCreateTicketClick} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition">
                                            <Bot className="text-purple-600 text-xl" />
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800">Create a Support Ticket</p>
                                                <p className="text-xs text-gray-500">Get assistance for your issue</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Callback Form Modal */}
                        {showCallbackForm && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative p-6 animate-slide-in-up">
                                    <button onClick={() => setShowCallbackForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={22} /></button>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Request a Callback</h3>
                                    <form onSubmit={handleCallbackSubmit} className="space-y-4">
                                        <Input 
                                            label="Your Phone Number" 
                                            value={callbackData.phone}
                                            onChange={e => setCallbackData({...callbackData, phone: e.target.value})}
                                            required
                                            variant="light"
                                            placeholder="Enter your phone number"
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for callback</label>
                                            <textarea 
                                                value={callbackData.message}
                                                onChange={e => setCallbackData({...callbackData, message: e.target.value})}
                                                required
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                placeholder="Briefly describe your issue..."
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button type="button" variant="secondary" onClick={() => setShowCallbackForm(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isSubmittingCallback}>
                                                {isSubmittingCallback ? <Loader className="animate-spin h-5 w-5" /> : 'Submit Request'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showCreateForm && (
                            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 max-w-2xl mx-auto">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Create a New Ticket</h2>
                                <form onSubmit={handleCreateTicket} className="space-y-4">
                                    <Input 
                                        label="Subject" 
                                        value={newTicket.subject}
                                        onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                                        required
                                        variant="light"
                                        placeholder="e.g., Issue with my website hosting"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Describe your issue</label>
                                        <textarea 
                                            value={newTicket.message}
                                            onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                                            required
                                            rows={5}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            placeholder="Please provide as much detail as possible..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Submit Ticket'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-10">Your Support Tickets</h2>
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="text-center py-10"><Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" /></td></tr>
                                    ) : tickets.length > 0 ? tickets.map(ticket => (
                                        <tr key={ticket._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={ticket.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.updatedAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link to={`/user/support/${ticket._id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-16 text-gray-500">
                                                 <MessageSquare size={40} className="mx-auto text-gray-400" />
                                                <h3 className="mt-2 text-lg font-medium text-gray-900">No support tickets found.</h3>
                                                <p className="mt-1 text-sm">Create one via the Help Center above.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserSupportPage;