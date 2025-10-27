import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { fetchAdminPages, createPage, updatePage, deletePage } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminManagePagesPage: React.FC = () => {
    const [pages, setPages] = useState<Page[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState({ title: '', slug: '', content: '', status: 'draft' as 'draft' | 'published' });
    const { addToast } = useToast();

    const loadPages = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminPages();
            setPages(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch pages', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadPages(); }, []);

    const handleEditClick = (page: Page) => {
        setEditingPage(page);
        setFormData({ title: page.title, slug: page.slug, content: page.content, status: page.status });
        setShowForm(true);
    };

    const handleAddNewClick = () => {
        setEditingPage(null);
        setFormData({ title: '', slug: '', content: '', status: 'draft' });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await deletePage(id);
                addToast('Page deleted successfully', 'success');
                loadPages();
            } catch (error: any) {
                addToast(error.message || 'Failed to delete page', 'error');
            }
        }
    };
    
    const handleSlugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        const newSlug = handleSlugify(newTitle);
        setFormData({ ...formData, title: newTitle, slug: newSlug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingPage) {
                await updatePage(editingPage._id, formData);
                addToast('Page updated successfully!', 'success');
            } else {
                await createPage(formData);
                addToast('Page created successfully!', 'success');
            }
            setShowForm(false);
            loadPages();
        } catch (error: any) {
            addToast(error.message || 'Failed to save page', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Manage Pages</h1>
                            <p className="mt-1 text-gray-600">Create and manage static pages for your site.</p>
                        </div>
                        {!showForm && (
                            <Button onClick={handleAddNewClick} className="flex items-center">
                                <Plus size={16} className="mr-2" /> Add New Page
                            </Button>
                        )}
                    </div>
                    {showForm ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingPage ? 'Edit' : 'Create'} Page</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Page Title" name="title" value={formData.title} onChange={handleTitleChange} required variant="light" />
                                <Input label="URL Slug" name="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: handleSlugify(e.target.value)})} required variant="light" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML allowed)</label>
                                    <textarea name="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required rows={10} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published'})} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save Page'}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pages.map(page => (
                                        <tr key={page._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{page.slug}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => handleEditClick(page)} className="text-cyan-600 hover:text-cyan-900"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(page._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminManagePagesPage;
