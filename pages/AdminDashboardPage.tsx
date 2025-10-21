import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminStats, MonthlyDataPoint, TicketStats, RecentActivity } from '../types';
import { fetchAdminStats } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Users, Server, DollarSign, HelpCircle, UserPlus, Package } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { useToast } from '../hooks/useToast';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 ${className}`} />
);

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-200/80">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />
        </div>
    </div>
);

const ChartSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
        <Skeleton className="h-6 w-1/3 mb-6 rounded" />
        <div className="flex justify-around items-end h-64 space-x-4">
            <Skeleton className="w-full h-3/4 rounded-t-md" />
            <Skeleton className="w-full h-1/2 rounded-t-md" />
            <Skeleton className="w-full h-5/6 rounded-t-md" />
            <Skeleton className="w-full h-2/3 rounded-t-md" />
            <Skeleton className="w-full h-1/2 rounded-t-md" />
            <Skeleton className="w-full h-3/4 rounded-t-md" />
        </div>
    </div>
);

const InfoPanelSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
        <Skeleton className="h-6 w-1/2 mb-4 rounded" />
        <div className="space-y-4 pt-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
        </div>
    </div>
);


const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => {
    const colorClasses = {
        green: { bg: 'bg-green-100', text: 'text-green-700' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
        cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    }[color] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-200/80">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
                <Icon className={`w-6 h-6 ${colorClasses.text}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ title: string; data: MonthlyDataPoint[]; color: string; formatAsCurrency?: boolean; }> = ({ title, data, color, formatAsCurrency = false }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
            <div className="flex justify-around items-end h-64 space-x-2 sm:space-x-4">
                {data.map(item => (
                    <div key={item.month} className="flex flex-col items-center flex-1 h-full justify-end">
                        <div
                            className={`w-full ${color} rounded-t-md hover:opacity-80 transition-opacity`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={formatAsCurrency ? `₹${item.value.toLocaleString()}` : String(item.value)}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TicketStatsDisplay: React.FC<{ stats: TicketStats }> = ({ stats }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-gray-400" />
            Support Ticket Status
        </h3>
        <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Open Tickets</span>
                <span className="font-bold text-blue-600 text-lg">{stats.open}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">In Progress</span>
                <span className="font-bold text-yellow-600 text-lg">{stats.in_progress}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Closed</span>
                <span className="font-bold text-gray-500 text-lg">{stats.closed}</span>
            </div>
        </div>
    </div>
);

const RecentActivityFeed: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => {
    const activityIcons = {
        new_user: <UserPlus className="w-5 h-5 text-green-500" />,
        new_service: <Package className="w-5 h-5 text-purple-500" />
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
            <ul className="space-y-4">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">{activityIcons[activity.type]}</div>
                        <div>
                            <p className="text-sm text-gray-700">{activity.text}</p>
                            <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const loadStats = async () => {
            try {
                const adminStats = await fetchAdminStats();
                setStats(adminStats);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch dashboard data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        // Simulate loading for demo purposes
        setTimeout(loadStats, 1000);
    }, [addToast]);

    if (!user) {
        // This case should be handled by ProtectedRoute, but as a fallback:
        return <div>Redirecting...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="mt-1 text-gray-600">Overview of your platform's activity.</p>
                        </div>
                        {isLoading ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <ChartSkeleton />
                                    <ChartSkeleton />
                                </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <InfoPanelSkeleton />
                                    <InfoPanelSkeleton />
                                </div>
                            </div>
                        ) : stats ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="blue" />
                                    <StatCard icon={Server} title="Active Services" value={stats.activeServices} color="green" />
                                    <StatCard 
                                        icon={DollarSign} 
                                        title="Revenue (Last 30 Days)" 
                                        value={`₹${stats.monthlyRevenue.toLocaleString()}`} 
                                        color="cyan" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <BarChart title="User Growth (Last 6 Months)" data={stats.userGrowthData} color="bg-blue-500" />
                                    <BarChart title="Revenue Trend (Last 6 Months)" data={stats.revenueTrendData} color="bg-green-500" formatAsCurrency />
                                </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <TicketStatsDisplay stats={stats.ticketStats} />
                                    <RecentActivityFeed activities={stats.recentActivities} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
                                Could not load dashboard data. Please try again later.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardPage;