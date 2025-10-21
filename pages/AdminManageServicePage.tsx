import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminService } from '../types';
import { fetchServiceById, updateService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';

const AdminManageServicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [service, setService] = useState<AdminService | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Form state
    const [status, setStatus] = useState<'active' | 'cancelled' | 'pending'>('pending');
    const [renewalDate, setRenewalDate] = useState('');

    useEffect(() => {
        if (!id) return;
        const loadService = async () => {
            try {
                const serviceData = await fetchServiceById(id);
                setService(serviceData);
                setStatus(serviceData.status);
                setRenewalDate(new Date(serviceData.renewalDate).toISOString().split('T')[0]);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch service data');
            } finally {
                setIsLoading(false);
            }
        };
        loadService();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsUpdating(true);
        try {
            await updateService(id, { status, renewalDate });
            addToast('Service updated successfully!', 'success');
            navigate('/admin/services');
        } catch (err: any) {
            addToast(err.message || 'Failed to update service', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600 bg-white rounded-lg shadow">{error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link to="/admin/services" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800">
                                <ArrowLeft size={16} className="mr-2" /> Back to Services
                            </Link>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h1 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Manage Service: {service?.planName}</h1>
                            
                            <div className="mb-6 space-y-2 text-sm">
                                <p><span className="font-semibold text-gray-600">User:</span> {service?.user.name}</p>
                                <p><span className="font-semibold text-gray-600">Email:</span> {service?.user.email}</p>
                                <p><span className="font-semibold text-gray-600">Price:</span> ₹{service?.price}</p>
                                <p><span className="font-semibold text-gray-600">Start Date:</span> {service && new Date(service.startDate).toLocaleDateString()}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Service Status</label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as 'active' | 'cancelled' | 'pending')}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700">Renewal Date</label>
                                    <input
                                        type="date"
                                        id="renewalDate"
                                        value={renewalDate}
                                        onChange={(e) => setRenewalDate(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isUpdating}>
                                        {isUpdating ? <Loader className="animate-spin h-5 w-5" /> : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminManageServicePage;
