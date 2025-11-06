import React, { useEffect, useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { FAQ, ServiceCategory } from '../types';
import { createTicket, fetchPublicFAQs, requestCallback, fetchCategories } from '../services/api';
import { Loader, Home, MessageSquare, Phone, FileText, CheckCircle, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

type SupportView = 'home' | 'newTicket' | 'requestCall';

// --- Sub-components for different views ---

const NavItem: React.FC<{ icon: React.ElementType, label: string, onClick: () => void, isActive: boolean }> = ({ icon: Icon, label, onClick, isActive }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 text-sm font-medium transition-colors w-full ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:bg-white/5'}`}>
        <Icon size={20} />
        <span className="mt-1">{label}</span>
    </button>
);

const HomeView: React.FC<{ user: any; faqCategories: string[]; }> = ({ user, faqCategories }) => (
    <>
        <h1 className="text-2xl font-bold text-white">Hello {user?.name.split(' ')[0]}! How can we help?</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
            <CheckCircle size={16} /> All Systems Operational
        </div>
        <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search for help" className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white" />
        </div>
        <div className="mt-6 space-y-2">
            {faqCategories.map(cat => (
                <button key={cat} className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 flex justify-between items-center group transition-colors">
                    <span className="text-gray-200">{cat}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
            ))}
        </div>
    </>
);

const NewTicketView: React.FC<{
    categories: ServiceCategory[];
    formData: { category: string; message: string };
    onFormChange: (data: { category: string; message: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    onBack: () => void;
}> = ({ categories, formData, onFormChange, onSubmit, isSubmitting, onBack }) => (
    <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="text-gray-300 hover:text-white"><ArrowLeft size={20} /></button>
            <h2 className="text-xl font-bold text-white">Create a Support Ticket</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Service Category</label>
                <select 
                    value={formData.category} 
                    onChange={e => onFormChange({ ...formData, category: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                >
                    <option value="" disabled>Choose a category...</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
            <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-300 mb-1">Enter Message</label>
                <textarea 
                    value={formData.message} 
                    onChange={e => onFormChange({ ...formData, message: e.target.value })} 
                    required 
                    rows={6}
                    className="w-full flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none" 
                    placeholder="Please describe your issue in detail..."
                />
            </div>
            <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Submit Ticket'}
                </Button>
            </div>
        </form>
    </div>
);

const RequestCallView: React.FC<{
    categories: ServiceCategory[];
    formData: { topic: string; phone: string; timeSlot: string };
    onFormChange: (data: { topic: string; phone: string; timeSlot: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    onBack: () => void;
}> = ({ categories, formData, onFormChange, onSubmit, isSubmitting, onBack }) => (
    <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="text-gray-300 hover:text-white"><ArrowLeft size={20} /></button>
            <h2 className="text-xl font-bold text-white">Request a Call</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Topic</label>
                <select value={formData.topic} onChange={e => onFormChange({ ...formData, topic: e.target.value })} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white">
                    <option value="" disabled>Choose a topic...</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
            <Input label="Contact Number" type="tel" name="phone" value={formData.phone} onChange={e => onFormChange({ ...formData, phone: e.target.value })} required />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Time Slot</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {['Morning', 'Afternoon', 'Evening'].map(slot => (
                        <button key={slot} type="button" onClick={() => onFormChange({ ...formData, timeSlot: slot })} className={`p-2 rounded-lg text-sm transition-colors ${formData.timeSlot === slot ? 'bg-cyan-600 text-white font-semibold' : 'bg-white/10 hover:bg-white/20'}`}>
                            {slot}
                        </button>
                    ))}
                </div>
            </div>
            <div className="pt-4 flex-grow flex items-end">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Submit Request'}
                </Button>
            </div>
        </form>
    </div>
);

const UserSupportPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [view, setView] = useState<SupportView>('home');
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [newTicket, setNewTicket] = useState({ category: '', message: '' });
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    
    const [callbackData, setCallbackData] = useState({ topic: '', phone: user?.phone || '', timeSlot: 'Morning' });
    const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
                if (categoriesData.length > 0) {
                    setNewTicket(prev => ({ ...prev, category: categoriesData[0].name }));
                    setCallbackData(prev => ({ ...prev, topic: categoriesData[0].name }));
                }
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch support categories', 'error');
            }
        };
        loadCategories();
    }, [addToast]);
    
    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTicket(true);
        try {
            await createTicket(newTicket.category, newTicket.message);
            addToast('Support ticket created successfully!', 'success');
            setView('home');
            setNewTicket({ category: categories[0]?.name || '', message: '' });
        } catch (error: any) {
             addToast(error.message || 'Failed to create ticket', 'error');
        } finally {
            setIsSubmittingTicket(false);
        }
    };
    
    const handleCallbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingCallback(true);
        try {
            const message = `Callback requested for topic: ${callbackData.topic}. Preferred time: ${callbackData.timeSlot}.`;
            await requestCallback(callbackData.phone, message);
            addToast("Callback request received! We'll call you back shortly.", "success");
            setView('home');
            setCallbackData({ topic: categories[0]?.name || '', phone: user?.phone || '', timeSlot: 'Morning' });
        } catch (error: any) {
            addToast(error.message || 'Failed to submit request', 'error');
        } finally {
            setIsSubmittingCallback(false);
        }
    };

    const faqQuickLinks = ['Manage My Services', 'Billing & Payments', 'Website / SEO Support', 'Social Media & Ads Support', 'Technical Issues', 'Other Queries'];
    
    const handleLiveChat = () => {
        addToast("Please use the chat widget in the bottom right for live support.", "info");
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-[#1E1E2C] via-[#12121A] to-black text-white rounded-2xl shadow-2xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6">
                                {view === 'home' && <HomeView user={user} faqCategories={faqQuickLinks} />}
                                {view === 'newTicket' && <NewTicketView categories={categories} formData={newTicket} onFormChange={setNewTicket} onSubmit={handleTicketSubmit} isSubmitting={isSubmittingTicket} onBack={() => setView('home')} />}
                                {view === 'requestCall' && <RequestCallView categories={categories} formData={callbackData} onFormChange={setCallbackData} onSubmit={handleCallbackSubmit} isSubmitting={isSubmittingCallback} onBack={() => setView('home')} />}
                            </div>
                            
                            <div className="flex-shrink-0 bg-black/30 border-t border-white/10 backdrop-blur-sm grid grid-cols-4">
                                <NavItem icon={Home} label="Home" onClick={() => setView('home')} isActive={view === 'home'} />
                                <NavItem icon={MessageSquare} label="Live Chat" onClick={handleLiveChat} isActive={false} />
                                <NavItem icon={Phone} label="Request Call" onClick={() => setView('requestCall')} isActive={view === 'requestCall'} />
                                <NavItem icon={FileText} label="New Ticket" onClick={() => setView('newTicket')} isActive={view === 'newTicket'} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserSupportPage;
