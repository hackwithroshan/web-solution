import React, { useEffect, useState } from 'react';
import { ServiceCategory } from '../types';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminManageCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const { addToast } = useToast();

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch categories', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [addToast]);

    const handleEditClick = (category: ServiceCategory) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setShowForm(true);
    };

    const handleAddNewClick = () => {
        setEditingCategory(null);
        setCategoryName('');
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
            try {
                await deleteCategory(id);
                addToast('Category deleted successfully', 'success');
                loadCategories();
            } catch (error: any) {
                addToast(error.message || 'Failed to delete category', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, categoryName);
                addToast('Category updated successfully!', 'success');
            } else {
                await createCategory(categoryName);
                addToast('Category created successfully!', 'success');
            }
            setShowForm(false);
            loadCategories();
        } catch (error: any) {
            addToast(error.message || 'Failed to save category', 'error');
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
                            <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
                            <p className="mt-1 text-gray-600">Group your service plans into categories.</p>
                        </div>
                        {!showForm && (
                            <Button onClick={handleAddNewClick} className="flex items-center">
                                <Plus size={16} className="mr-2" /> Add New Category
                            </Button>
                        )}
                    </div>
                    {showForm ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 max-w-lg">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingCategory ? 'Edit' : 'Create'} Category</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required variant="light" />
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save Category'}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map(cat => (
                                        <tr key={cat._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => handleEditClick(cat)} className="text-cyan-600 hover:text-cyan-900"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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

export default AdminManageCategoriesPage;