import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, Mail } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link.');
      }
      
      addToast(data.message, 'success');
      setIsSubmitted(true);
    } catch (error: any) {
      addToast(error.message || 'An error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <Mail className="h-12 w-auto text-cyan-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSubmitted 
              ? "Check your inbox for the password reset link." 
              : "No problem. Enter your email and we'll send you a reset link."
            }
          </p>
        </div>
        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="light"
            />
            <div>
              <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">If you don't see the email, please check your spam folder.</p>
          </div>
        )}
         <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-gray-600 hover:text-cyan-500">
              Back to Login
            </Link>
          </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
