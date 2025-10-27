import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, Mail, KeyRound } from 'lucide-react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

const AuthGraphic: React.FC = () => (
  <div className="hidden lg:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
    <div 
        className="absolute w-64 h-64 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full animate-float-3d auth-graphic-orb"
        style={{ filter: 'blur(30px)'}}
    ></div>
    <KeyRound className="w-24 h-24 text-blue-400 mb-6 relative z-10" />
    <h1 className="text-3xl font-bold mb-4 text-center relative z-10">Reset Your Password</h1>
    <p className="text-center text-gray-300 max-w-sm relative z-10">
      Enter your email address and we'll send you a link to get back into your account.
    </p>
  </div>
);


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
    <>
      <SeoMeta
        title="Forgot Password - ApexNucleus"
        description="Reset your ApexNucleus account password to regain access."
      />
      <div className="relative min-h-screen w-full bg-[#1E1E2C] text-white">
        <div className="fixed inset-0 z-0">
            <RippleGrid
                gridColor="#252535"
                rippleIntensity={0.02}
                gridSize={20}
                mouseInteraction={true}
            />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
             <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <AuthGraphic />
                <div className="flex items-center justify-center p-8 md:p-10">
                   <div className="w-full max-w-md">
                      <div className="flex justify-center mb-6">
                          <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-8 w-auto" />
                      </div>
                      
                      <h2 className="text-center text-3xl font-bold text-white">
                        Forgot Password
                      </h2>
                      <p className="mt-2 text-center text-sm text-gray-400">
                        {isSubmitted 
                          ? "Check your inbox for the password reset link." 
                          : "Enter your email and we'll send you a link."
                        }
                      </p>
                      
                      {!isSubmitted ? (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                          <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            icon={<Mail className="w-5 h-5 text-gray-400" />}
                          />
                          <div>
                            <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                              {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Send Reset Link'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center mt-8">
                          <p className="text-gray-300">If you don't see the email, please check your spam folder.</p>
                        </div>
                      )}

                       <p className="text-center text-sm text-gray-400 mt-6">
                          Remembered your password?{' '}
                          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                              Back to Login
                          </Link>
                      </p>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;