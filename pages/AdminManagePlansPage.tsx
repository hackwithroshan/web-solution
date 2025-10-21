import React, { useEffect, useState, useMemo } from 'react';
import { ServicePlan, ServiceCategory } from '../types';
import { fetchAdminServicePlans, fetchCategories, createServicePlan, updateServicePlan, deleteServicePlan } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminManagePlansPage: React.FC = () => {
    const [plans, setPlans] = useState<ServicePlan[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);

    const initialFormData: Omit<ServicePlan, '_id' | 'category'> & { category: string } = {
        name: '', category: '', price: 0, priceUnit: '/month', description: '', keyFeatures: [], tags: []
    };
    const [formData, setFormData] = useState(initialFormData);

    const { addToast } = useToast();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [plansData, categoriesData] = await Promise.all([fetchAdminServicePlans(), fetchCategories()]);
            setPlans(plansData);
            setCategories(categoriesData);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [addToast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'keyFeatures' || name === 'tags') {
            setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleEditClick = (plan: ServicePlan) => {
        setEditingPlan(plan);
        setFormData({
            ...plan,
            category: plan.category._id
        });
        setShowForm(true);
    };
    
    const handleAddNewClick = () => {
        setEditingPlan(null);
        setFormData(initialFormData);
        setShowForm(true);
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this service plan?')) {
            try {
                await deleteServicePlan(id);
                addToast('Plan deleted successfully', 'success');
                loadData();
            } catch (error: any) {
                addToast(error.message || 'Failed to delete plan', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingPlan) {
                await updateServicePlan(editingPlan._id, formData);
                addToast('Plan updated successfully!', 'success');
            } else {
                await createServicePlan(formData);
                addToast('Plan created successfully!', 'success');
            }
            setShowForm(false);
            loadData();
        } catch (error: any) {
            addToast(error.message || 'Failed to save plan', 'error');
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
                            <h1 className="text-2xl font-bold text-gray-800">Manage Service Plans</h1>
                            <p className="mt-1 text-gray-600">Add, edit, or remove service plans offered to users.</p>
                        </div>
                         {!showForm && (
                             <Button onClick={handleAddNewClick} className="flex items-center">
                                 <Plus size={16} className="mr-2" /> Add New Plan
                             </Button>
                         )}
                    </div>
                    {showForm ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                             <h2 className="text-lg font-bold text-gray-800 mb-4">{editingPlan ? 'Edit' : 'Create'} Service Plan</h2>
                             <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Plan Name" name="name" value={formData.name} onChange={handleInputChange} required variant="light" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                            <option value="">Select a category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Price (in ₹)" name="price" type="number" value={formData.price} onChange={handleInputChange} required variant="light" />
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                                        <select name="priceUnit" value={formData.priceUnit} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                            <option value="/month">/month</option>
                                            <option value="/year">/year</option>
                                            <option value="/project">/project</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" />
                                </div>
                                <Input label="Key Features (comma-separated)" name="keyFeatures" value={formData.keyFeatures.join(', ')} onChange={handleInputChange} variant="light" />
                                <Input label="Tags (comma-separated)" name="tags" value={formData.tags.join(', ')} onChange={handleInputChange} variant="light" />

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save Plan'}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {plans.map(plan => (
                                        <tr key={plan._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.category?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{plan.price}{plan.priceUnit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                <button onClick={() => handleEditClick(plan)} className="text-cyan-600 hover:text-cyan-900"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(plan._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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

export default AdminManagePlansPage;