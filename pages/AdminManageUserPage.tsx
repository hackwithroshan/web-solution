

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, UserService, UserRole, ServicePlan } from '../types';
import { fetchUserById, updateUser, adminFetchUserServices, adminAddServiceToUser, adminDeleteUserService, fetchAdminServicePlans, adminUpdateUserService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, ArrowLeft, Plus, Trash2, Edit, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface EditServiceModalProps {
    service: UserService;
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceId: string, data: any) => Promise<void>;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ service, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        planName: service.planName,
        renewalDate: new Date(service.renewalDate).toISOString().split('T')[0],
        price: service.price,
        status: service.status,
        domainName: service.domainName || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            planName: service.planName,
            renewalDate: new Date(service.renewalDate).toISOString().split('T')[0],
            price: service.price,
            status: service.status,
            domainName: service.domainName || ''
        });
    }, [service]);

    const isDomainService = service.planName.toLowerCase().includes('domain');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(service._id, formData);
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative animate-slide-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <h3 className="text-lg font-bold p-6 border-b">Edit Service</h3>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <Input label="Plan Name" name="planName" value={formData.planName} onChange={handleChange} variant="light" required />
                        {isDomainService && (
                            <Input label="Domain Name" name="domainName" value={formData.domainName} onChange={handleChange} variant="light" placeholder="e.g., example.com" />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} variant="light" required />
                            <Input label="Renewal Date" name="renewalDate" type="date" value={formData.renewalDate} onChange={handleChange} variant="light" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader className="animate-spin h-5 w-5" /> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminManageUserPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [services, setServices] = useState<UserService[]>([]);
    const [allPlans, setAllPlans] = useState<ServicePlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Form states
    const [userData, setUserData] = useState({ name: '', email: '', role: 'user' as UserRole, status: 'active' as 'active' | 'inactive' });
    const [showAddService, setShowAddService] = useState(false);
    const [newServiceData, setNewServiceData] = useState({ planId: '', renewalDate: ''});
    const [editingService, setEditingService] = useState<UserService | null>(null);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [userData, servicesData, plansData] = await Promise.all([
                    fetchUserById(id),
                    adminFetchUserServices(id),
                    fetchAdminServicePlans()
                ]);
                setUser(userData);
                setUserData({ name: userData.name, email: userData.email, role: userData.role, status: userData.status });
                setServices(servicesData);
                setAllPlans(plansData);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch user data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, addToast]);

    const handleUserUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsUpdating(true);
        try {
            await updateUser(id, userData);
            addToast('User details updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update user', 'error');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !newServiceData.planId || !newServiceData.renewalDate) {
            addToast('Please select a plan and renewal date', 'error');
            return;
        }
        setIsUpdating(true);
        try {
            const selectedPlan = allPlans.find(p => p._id === newServiceData.planId);
            if (!selectedPlan) throw new Error('Selected plan not found.');

            await adminAddServiceToUser(id, {
                planName: selectedPlan.name,
                price: selectedPlan.price,
                startDate: new Date().toISOString(),
                renewalDate: newServiceData.renewalDate,
                status: 'active'
            });
            addToast('Service added to user!', 'success');
            // Refresh services list
            const updatedServices = await adminFetchUserServices(id);
            setServices(updatedServices);
            setShowAddService(false);
            setNewServiceData({planId: '', renewalDate: ''});
        } catch (err: any) {
             addToast(err.message || 'Failed to add service', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!id) return;
        if (window.confirm('Are you sure you want to remove this service from the user?')) {
            try {
                await adminDeleteUserService(id, serviceId);
                addToast('Service removed successfully', 'success');
                setServices(services.filter(s => s._id !== serviceId));
            } catch (err: any) {
                addToast(err.message || 'Failed to remove service', 'error');
            }
        }
    };

    const handleSaveService = async (serviceId: string, data: any) => {
        if (!id) return;
        try {
            const updateData = { ...data, price: Number(data.price) };
            await adminUpdateUserService(id, serviceId, updateData);
            addToast('Service updated successfully!', 'success');
            const updatedServices = await adminFetchUserServices(id);
            setServices(updatedServices);
            setEditingService(null); // Close modal
        } catch (err: any) {
            addToast(err.message || 'Failed to update service', 'error');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                     <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link to="/admin/users" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800">
                                <ArrowLeft size={16} className="mr-2" /> Back to Users
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-gray-800 border-b pb-4 mb-6">User Details</h2>
                             <form onSubmit={handleUserUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Full Name" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} variant="light" />
                                    <Input label="Email" type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} variant="light" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select value={userData.role} onChange={e => setUserData({...userData, role: e.target.value as UserRole})} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                            <option value="user">User</option>
                                            <option value="support">Support</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={userData.status} onChange={e => setUserData({...userData, status: e.target.value as 'active' | 'inactive'})} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
                                </div>
                            </form>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <h2 className="text-lg font-bold text-gray-800">User Services ({services.length})</h2>
                                <Button onClick={() => setShowAddService(!showAddService)} variant="secondary" className="flex items-center text-sm py-2 px-4">
                                    <Plus size={16} className="mr-2" /> Add Service
                                </Button>
                            </div>
                            {showAddService && (
                                <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6 p-4 border rounded-lg bg-slate-50">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Plan</label>
                                        <select value={newServiceData.planId} onChange={e => setNewServiceData({...newServiceData, planId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-black" required>
                                            <option value="">Select a plan...</option>
                                            {allPlans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                                        </select>
                                    </div>
                                    <Input label="Next Renewal Date" type="date" value={newServiceData.renewalDate} onChange={e => setNewServiceData({...newServiceData, renewalDate: e.target.value})} required variant="light"/>
                                    <div className="md:col-span-3 flex justify-end gap-2">
                                        <Button type="button" variant="secondary" onClick={() => setShowAddService(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isUpdating}>{isUpdating ? 'Adding...' : 'Add Service'}</Button>
                                    </div>
                                </form>
                            )}
                            <div className="space-y-3">
                                {services.length > 0 ? services.map(service => {
                                    const isDomainService = service.planName.toLowerCase().includes('domain');
                                    return (
                                    <div key={service._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            {isDomainService && service.domainName ? (
                                                <a href={`https://${service.domainName.replace(/^(https?:\/\/)/, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">{service.planName} ({service.domainName})</a>
                                            ) : (
                                                <p className="font-semibold text-gray-800">{service.planName}</p>
                                            )}
                                            <p className="text-sm text-gray-500">Renews on {new Date(service.renewalDate).toLocaleDateString()} for ₹{service.price}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setEditingService(service)} className="text-cyan-600 hover:text-cyan-800"><Edit size={18}/></button>
                                            <button onClick={() => handleDeleteService(service._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                    )
                                }) : <p className="text-center text-gray-500 py-4">This user has no services.</p>}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {editingService && (
                <EditServiceModal 
                    service={editingService}
                    isOpen={!!editingService}
                    onClose={() => setEditingService(null)}
                    onSave={handleSaveService}
                />
            )}
        </div>
    );
};

export default AdminManageUserPage;