import React, { useEffect, useState } from 'react';
import { ChatbotKnowledge } from '../types';
import { fetchChatbotKnowledge, createChatbotKnowledge, updateChatbotKnowledge, deleteChatbotKnowledge } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Edit, Trash2, Bot } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminManageChatbotPage: React.FC = () => {
    const [knowledge, setKnowledge] = useState<ChatbotKnowledge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<ChatbotKnowledge | null>(null);
    const [formData, setFormData] = useState({ question: '', answer: '', keywords: '' });
    const { addToast } = useToast();

    const loadKnowledge = async () => {
        setIsLoading(true);
        try {
            const data = await fetchChatbotKnowledge();
            setKnowledge(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch chatbot knowledge', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => { loadKnowledge(); }, [addToast]);

    const handleEditClick = (item: ChatbotKnowledge) => {
        setEditingItem(item);
        setFormData({ question: item.question, answer: item.answer, keywords: item.keywords.join(', ') });
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleAddNewClick = () => {
        setEditingItem(null);
        setFormData({ question: '', answer: '', keywords: '' });
        setShowForm(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this knowledge entry?')) {
            try {
                await deleteChatbotKnowledge(id);
                addToast('Knowledge entry deleted successfully', 'success');
                loadKnowledge();
            } catch (error: any) {
                addToast(error.message || 'Failed to delete entry', 'error');
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSubmit = {
            question: formData.question,
            answer: formData.answer,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        };

        try {
            if (editingItem) {
                await updateChatbotKnowledge(editingItem._id, dataToSubmit);
                addToast('Knowledge entry updated successfully!', 'success');
            } else {
                await createChatbotKnowledge(dataToSubmit as Omit<ChatbotKnowledge, '_id'>);
                addToast('Knowledge entry created successfully!', 'success');
            }
            setShowForm(false);
            loadKnowledge();
        } catch (error: any) {
            addToast(error.message || 'Failed to save entry', 'error');
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
                            <h1 className="text-2xl font-bold text-gray-800">Manage Chatbot Knowledge</h1>
                            <p className="mt-1 text-gray-600">Train the support bot by adding questions and answers.</p>
                        </div>
                        {!showForm && (
                            <Button onClick={handleAddNewClick} className="flex items-center">
                                <Plus size={16} className="mr-2" /> Add Knowledge
                            </Button>
                        )}
                    </div>
                    {showForm ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                             <h2 className="text-lg font-bold text-gray-800 mb-4">{editingItem ? 'Edit' : 'Create'} Knowledge Entry</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="User's Question" name="question" value={formData.question} onChange={handleInputChange} required variant="light" placeholder="e.g., How do I reset my password?" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bot's Answer</label>
                                    <textarea name="answer" value={formData.answer} onChange={handleInputChange} required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" />
                                </div>
                                 <Input label="Keywords (comma-separated)" name="keywords" value={formData.keywords} onChange={handleInputChange} variant="light" placeholder="e.g., reset, password, forgotten" />
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save Entry'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {knowledge.map(item => (
                                        <tr key={item._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.question}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-sm">{item.answer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => handleEditClick(item)} className="text-cyan-600 hover:text-cyan-900"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {knowledge.length === 0 && (
                                <div className="text-center p-12">
                                    <Bot size={40} className="mx-auto text-gray-400" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-800">No Knowledge Entries Found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Click "Add Knowledge" to start training the bot.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminManageChatbotPage;
