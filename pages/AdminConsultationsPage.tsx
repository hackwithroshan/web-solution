import React, { useEffect, useState } from 'react';
import { Consultation } from '../types';
import { fetchAdminConsultations, updateConsultationStatus } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const StatusBadge: React.FC<{ status: 'pending' | 'contacted' }> = ({ status }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800',
        contacted: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const AdminConsultationsPage: React.FC = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();

    const loadConsultations = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminConsultations();
            setConsultations(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch consultations', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConsultations();
    }, [addToast]);
    
    const handleStatusChange = async (id: string, newStatus: 'pending' | 'contacted') => {
        try {
            await updateConsultationStatus(id, newStatus);
            addToast('Status updated successfully!', 'success');
            loadConsultations();
        } catch (error: any) {
            addToast(error.message || 'Failed to update status', 'error');
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
                            <h1 className="text-2xl font-bold text-gray-800">Consultation Requests</h1>
                            <p className="mt-1 text-gray-600">View and manage consultation requests from users.</p>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Loader className="w-12 h-12 animate-spin text-cyan-600" /></div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {consultations.map(c => (
                                        <tr key={c._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{c.email}</div>
                                                <div>{c.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={c.message}>{c.message}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value as 'pending' | 'contacted')} className="p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                                    <option value="pending">Pending</option>
                                                    <option value="contacted">Contacted</option>
                                                </select>
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

export default AdminConsultationsPage;