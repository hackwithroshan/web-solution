import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminStats, MonthlyDataPoint, TicketStats, RecentActivity } from '../types';
import { fetchAdminStats } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Users, Server, DollarSign, LifeBuoy, UserPlus, Package } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { useToast } from '../hooks/useToast';

// --- Skeleton Components for Loading State ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
    </div>
);

const ChartSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <div className="flex justify-around items-end h-64 space-x-4">
            <Skeleton className="w-full h-3/4" />
            <Skeleton className="w-full h-1/2" />
            <Skeleton className="w-full h-5/6" />
            <Skeleton className="w-full h-2/3" />
            <Skeleton className="w-full h-1/2" />
            <Skeleton className="w-full h-3/4" />
        </div>
    </div>
);

const InfoPanelSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="space-y-4 pt-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);


const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number }> = ({ icon: Icon, title, value }) => {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
            <Icon className="w-8 h-8 text-gray-400" />
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-black">{value}</p>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ title: string; data: MonthlyDataPoint[]; formatAsCurrency?: boolean; }> = ({ title, data, formatAsCurrency = false }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
            <h3 className="text-lg font-bold text-black mb-6">{title}</h3>
            <div className="flex justify-around items-end h-64 space-x-2 sm:space-x-4">
                {data.map(item => (
                    <div key={item.month} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div
                            className="w-full bg-gray-200 rounded-t-md hover:bg-black transition-colors duration-300"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={formatAsCurrency ? `₹${item.value.toLocaleString()}` : String(item.value)}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TicketStatsDisplay: React.FC<{ stats: TicketStats }> = ({ stats }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center">
            <LifeBuoy className="w-5 h-5 mr-3 text-gray-400" />
            Support Ticket Status
        </h3>
        <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Open Tickets</span>
                <span className="font-bold text-black text-lg px-2 py-0.5 bg-gray-200 rounded-md">{stats.open}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">In Progress</span>
                <span className="font-bold text-black text-lg px-2 py-0.5 bg-gray-200 rounded-md">{stats.in_progress}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Closed</span>
                <span className="font-bold text-black text-lg px-2 py-0.5 bg-gray-200 rounded-md">{stats.closed}</span>
            </div>
        </div>
    </div>
);

const RecentActivityFeed: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => {
    const activityIcons = {
        new_user: <UserPlus className="w-5 h-5 text-gray-600" />,
        new_service: <Package className="w-5 h-5 text-gray-600" />
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
            <h3 className="text-lg font-bold text-black mb-4">Recent Activity</h3>
            <ul className="space-y-4">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1 p-2 bg-gray-100 rounded-full">{activityIcons[activity.type]}</div>
                        <div>
                            <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
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
        setTimeout(loadStats, 1000);
    }, [addToast]);

    if (!user) {
        return <div>Redirecting...</div>;
    }

    return (
        <div className="flex h-screen bg-dashboard">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
                            <p className="mt-1 text-gray-500">Welcome back, {user.name}. Here's an overview of your platform.</p>
                        </div>
                        {isLoading ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2"><ChartSkeleton /></div>
                                    <InfoPanelSkeleton />
                                </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2"><ChartSkeleton /></div>
                                    <InfoPanelSkeleton />
                                </div>
                            </div>
                        ) : stats ? (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard icon={Users} title="Total Users" value={stats.totalUsers} />
                                        <StatCard icon={Server} title="Active Services" value={stats.activeServices} />
                                        <StatCard 
                                            icon={DollarSign} 
                                            title="Revenue (30d)" 
                                            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <BarChart title="User Growth" data={stats.userGrowthData} />
                                        <BarChart title="Revenue Trend" data={stats.revenueTrendData} formatAsCurrency />
                                    </div>
                                </div>
                                 <div className="lg:col-span-1 space-y-6">
                                    <TicketStatsDisplay stats={stats.ticketStats} />
                                    <RecentActivityFeed activities={stats.recentActivities} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border">
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