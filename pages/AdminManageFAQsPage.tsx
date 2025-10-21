import React, { useEffect, useState } from 'react';
import { FAQ } from '../types';
import { fetchAdminFAQs, createFAQ, updateFAQ, deleteFAQ } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminManageFAQsPage: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ question: '', answer: '', category: '' });
    const { addToast } = useToast();

    const loadFaqs = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminFAQs();
            setFaqs(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch FAQs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
    }, [addToast]);

    const handleEditClick = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer, category: faq.category });
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleAddNewClick = () => {
        setEditingFaq(null);
        setFormData({ question: '', answer: '', category: '' });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await deleteFAQ(id);
                addToast('FAQ deleted successfully', 'success');
                loadFaqs();
            } catch (error: any) {
                addToast(error.message || 'Failed to delete FAQ', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingFaq) {
                await updateFAQ(editingFaq._id, formData);
                addToast('FAQ updated successfully!', 'success');
            } else {
                await createFAQ(formData);
                addToast('FAQ created successfully!', 'success');
            }
            setShowForm(false);
            loadFaqs();
        } catch (error: any) {
            addToast(error.message || 'Failed to save FAQ', 'error');
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
                            <h1 className="text-2xl font-bold text-gray-800">Manage FAQs</h1>
                            <p className="mt-1 text-gray-600">Create and manage FAQs for the AI support bot.</p>
                        </div>
                        {!showForm && (
                            <Button onClick={handleAddNewClick} className="flex items-center">
                                <Plus size={16} className="mr-2" /> Add New FAQ
                            </Button>
                        )}
                    </div>
                    {showForm ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingFaq ? 'Edit' : 'Create'} FAQ</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Category" name="category" value={formData.category} onChange={handleInputChange} required variant="light" placeholder="e.g., Billing, Technical" />
                                <Input label="Question" name="question" value={formData.question} onChange={handleInputChange} required variant="light" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                    <textarea name="answer" value={formData.answer} onChange={handleInputChange} required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save FAQ'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>
                    ) : (
                        <div className="space-y-3">
                            {faqs.map(faq => (
                                <div key={faq._id} className="bg-white rounded-xl shadow-sm">
                                    <button onClick={() => setOpenFaqId(openFaqId === faq._id ? null : faq._id)} className="w-full flex justify-between items-center p-4 text-left">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-cyan-700">{faq.category}</span>
                                            <p className="font-semibold text-gray-800">{faq.question}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={(e) => { e.stopPropagation(); handleEditClick(faq); }} className="text-gray-500 hover:text-cyan-700"><Edit size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }} className="text-gray-500 hover:text-red-700"><Trash2 size={16} /></button>
                                            {openFaqId === faq._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    {openFaqId === faq._id && (
                                        <div className="p-4 border-t text-gray-600 whitespace-pre-wrap">{faq.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminManageFAQsPage;