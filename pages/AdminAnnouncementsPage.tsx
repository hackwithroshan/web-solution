import React, { useEffect, useState } from 'react';
import { Announcement } from '../types';
import { fetchAnnouncements, createAnnouncement } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Send, Megaphone } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminAnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '' });
    const { addToast } = useToast();

    const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAnnouncements();
            setAnnouncements(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch announcements', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, [addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAnnouncement(formData.title, formData.message);
            addToast('Announcement sent to all users!', 'success');
            setShowForm(false);
            setFormData({ title: '', message: '' });
            loadAnnouncements();
        } catch (error: any) {
            addToast(error.message || 'Failed to send announcement', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                            <p className="mt-1 text-gray-600">Send notifications to all users.</p>
                        </div>
                        {!showForm && (
                            <Button onClick={() => setShowForm(true)} className="flex items-center">
                                <Plus size={16} className="mr-2" /> New Announcement
                            </Button>
                        )}
                    </div>
                    {showForm && (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Create Announcement</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Title" name="title" value={formData.title} onChange={handleInputChange} required variant="light" placeholder="e.g., New Feature Alert" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" placeholder="Describe the announcement..."/>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : <><Send size={16} className="mr-2"/> Send to All Users</>}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Sent History</h3>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>
                    ) : announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map(announcement => (
                                <div key={announcement._id} className="bg-white rounded-xl shadow-sm p-5">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800">{announcement.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(announcement.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 mb-3">
                                        Sent by {announcement.createdBy?.name || 'Admin'}
                                    </p>
                                    <div className="border-t pt-3">
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{announcement.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="bg-white rounded-xl shadow-sm text-center p-12">
                            <Megaphone size={40} className="mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-800">No Announcements Sent</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Use the 'New Announcement' button to send a notification to all users.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminAnnouncementsPage;