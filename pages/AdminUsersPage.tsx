import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { fetchUsers, adminCreateUser, deleteUser } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import AdminSidebar from '../components/AdminSidebar';
import { Loader, Bell, Search, Users, Plus, Menu } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';


const AdminHeader: React.FC<{ title: string; onMenuClick: () => void; }> = ({ title, onMenuClick }) => {
    const { user } = useAuth();
    return (
        <header className="flex justify-between items-center p-6 bg-white border-b">
            <button onClick={onMenuClick} className="lg:hidden text-gray-600">
                <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">{title}</h1>
            <div className="flex-grow"></div>
            <div className="flex items-center space-x-5">
                 <button className="relative text-gray-500 hover:text-gray-700">
                    <Bell size={22}/>
                 </button>
                 <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                        {user?.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="font-semibold text-sm text-gray-700">{user?.name}</span>
                 </div>
            </div>
        </header>
    );
}

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const roleStyles = {
        admin: 'bg-cyan-100 text-cyan-800',
        user: 'bg-gray-100 text-gray-800',
        support: 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[role]}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
};

const StatusBadge: React.FC<{ status: 'active' | 'inactive' }> = ({ status }) => {
    const statusStyles = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-200 text-gray-800',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};


const UsersTable: React.FC<{ users: User[], onDelete: (userId: string) => void }> = ({ users, onDelete }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm"><RoleBadge role={user.role} /></td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={user.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/admin/users/${user._id}`} className="text-cyan-600 hover:text-cyan-900">Manage</Link>
                            <button onClick={() => onDelete(user._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' as UserRole });
    const { addToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt-desc');

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await fetchUsers();
            setUsers(userList);
        } catch (err: any) {
            addToast(err.message || 'Failed to fetch users data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [addToast]);

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value as UserRole });
    };

    const handleAddNewUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password) {
            addToast('Please fill all required fields.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await adminCreateUser(newUser);
            addToast('User created successfully!', 'success');
            setShowAddUserForm(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            loadUsers(); // Refresh user list
        } catch (error: any) {
            addToast(error.message || 'Failed to create user', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This will also remove all their associated services and cannot be undone.')) {
            try {
                await deleteUser(userId);
                addToast('User deleted successfully', 'success');
                loadUsers();
            } catch (err: any) {
                addToast(err.message || 'Failed to delete user', 'error');
            }
        }
    };


    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm)
            );
        }

        const [sortField, sortOrder] = sortBy.split('-');
        filtered.sort((a, b) => {
            const valA = new Date(a.createdAt).getTime();
            const valB = new Date(b.createdAt).getTime();
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        });

        return filtered;
    }, [users, searchTerm, roleFilter, sortBy]);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <AdminHeader title="User Management" onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                     <div className="flex justify-end items-center mb-6">
                         {!showAddUserForm && (
                             <Button onClick={() => setShowAddUserForm(true)} className="flex items-center">
                                 <Plus size={16} className="mr-2" />
                                 Add New User
                             </Button>
                         )}
                    </div>
                    {showAddUserForm && (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Create New User</h2>
                            <form onSubmit={handleAddNewUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" name="name" value={newUser.name} onChange={handleNewUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" value={newUser.email} onChange={handleNewUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input type="password" name="password" value={newUser.password} onChange={handleNewUserChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select name="role" value={newUser.role} onChange={handleNewUserChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md" required>
                                        <option value="user">User</option>
                                        <option value="support">Support</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                                    <Button type="button" variant="secondary" onClick={() => setShowAddUserForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                     <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="support">Support</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                     {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                           <Loader className="w-12 h-12 animate-spin text-cyan-600" />
                        </div>
                     ) : filteredUsers.length > 0 ? (
                        <UsersTable users={filteredUsers} onDelete={handleDeleteUser} />
                     ) : (
                        <div className="bg-white rounded-xl shadow-sm text-center p-12">
                            <Users size={40} className="mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-800">No Users Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || roleFilter !== 'all' ? "No users match your current filters." : "There are currently no users to display."}
                            </p>
                        </div>
                     )}
                </main>
            </div>
        </div>
    );
};

export default AdminUsersPage;