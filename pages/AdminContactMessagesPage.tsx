import React, { useEffect, useState } from 'react';
import { ContactSubmission } from '../types';
import { fetchContactSubmissions, updateContactSubmissionStatus } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const StatusBadge: React.FC<{ status: 'new' | 'read' | 'archived' }> = ({ status }) => {
    const statusStyles = {
        new: 'bg-blue-100 text-blue-800',
        read: 'bg-gray-100 text-gray-800',
        archived: 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const AdminContactMessagesPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await fetchContactSubmissions();
            setSubmissions(data);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch messages', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, [addToast]);
    
    const handleStatusChange = async (id: string, newStatus: 'new' | 'read' | 'archived') => {
        try {
            await updateContactSubmissionStatus(id, newStatus);
            addToast('Status updated successfully!', 'success');
            loadSubmissions(); // Refresh the list
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
                            <h1 className="text-2xl font-bold text-gray-800">Contact Form Messages</h1>
                            <p className="mt-1 text-gray-600">Messages submitted through the public contact page.</p>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map(s => (
                                        <tr key={s._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="font-medium text-gray-900">{s.name}</div>
                                                <div className="text-gray-500">{s.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={s.message}>{s.message}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select value={s.status} onChange={(e) => handleStatusChange(s._id, e.target.value as 'new' | 'read' | 'archived')} className="p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                                    <option value="new">New</option>
                                                    <option value="read">Read</option>
                                                    <option value="archived">Archived</option>
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

export default AdminContactMessagesPage;