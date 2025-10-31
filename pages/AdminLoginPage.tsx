import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Shield, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, user } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password).catch(() => {
        // Catch login errors to prevent unhandled promise rejections.
        // The error toast is already handled by the useAuth hook.
    });
  };
  
  // Effect to navigate after any login attempt or if a user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'support') {
        navigate('/support/dashboard', { replace: true });
      } else {
        // A regular user is trying to access the admin portal.
        addToast("You are not authorized to access the admin portal.", "error");
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [user, navigate, addToast]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
             <Shield className="h-12 w-auto text-cyan-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal Sign-in
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Admin Email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              variant="light"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              variant="light"
            />
          </div>

          <div>
            <Button type="submit" className="w-full justify-center" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Sign in'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-gray-600 hover:text-cyan-500">
              Return to User Login
            </Link>
          </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;