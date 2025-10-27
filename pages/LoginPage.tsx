import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';

const AuthGraphic: React.FC = () => (
  <div className="hidden lg:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
    <div 
        className="absolute w-64 h-64 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full animate-float-3d auth-graphic-orb"
        style={{ filter: 'blur(30px)'}}
    ></div>
    <ShieldCheck className="w-24 h-24 text-blue-400 mb-6 relative z-10" />
    <h1 className="text-3xl font-bold mb-4 text-center relative z-10">Secure & Seamless Access</h1>
    <p className="text-center text-gray-300 max-w-sm relative z-10">
      Welcome to ApexNucleus. Log in to manage your services, view your dashboard, and get support.
    </p>
  </div>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyLogin2FA, isLoading, user } = useAuth();

  const from = location.state?.from?.pathname || null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password).then(result => {
      if (result?.twoFactorRequired && result.twoFactorToken) {
          setTwoFactorToken(result.twoFactorToken);
          setIsTwoFactorStep(true);
      }
    }).catch(() => {
        // Error is handled by the auth hook's toast, so nothing to do here.
        // This catch block just prevents unhandled promise rejection warnings.
    });
  };
  
  const handleTwoFactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyLogin2FA(twoFactorToken, twoFactorCode).catch(() => {
        // Error is handled by the auth hook's toast.
    });
  };
  
  useEffect(() => {
    if (user) {
        const redirectPath = from || (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <>
      <SeoMeta
        title="Login - ApexNucleus"
        description="Log in to your ApexNucleus account to manage your services, view your dashboard, and get support."
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
                          <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-8 w-auto" loading="lazy" decoding="async" />
                      </div>
                      
                      {!isTwoFactorStep ? (
                          <>
                              <h2 className="text-center text-3xl font-bold text-white">
                                  Welcome Back!
                              </h2>
                              <p className="mt-2 text-center text-sm text-gray-400">
                                  Login to manage your services.
                              </p>
                              <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
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
                                  <Input
                                  id="password"
                                  name="password"
                                  type="password"
                                  autoComplete="current-password"
                                  required
                                  placeholder="Password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  disabled={isLoading}
                                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                                  />

                                  <div className="flex items-center justify-end">
                                      <div className="text-sm">
                                      <Link to="/forgot-password" className="font-medium text-blue-500 hover:text-blue-400">
                                          Forgot password?
                                      </Link>
                                      </div>
                                  </div>

                                  <div>
                                      <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                                      {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Sign In'}
                                      </Button>
                                  </div>

                                  <p className="text-center text-sm text-gray-400">
                                      Don't have an account?{' '}
                                      <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400">
                                          Sign Up
                                      </Link>
                                  </p>
                              </form>
                          </>
                      ) : (
                           <>
                              <h2 className="text-center text-3xl font-bold text-white">
                                  Two-Factor Authentication
                              </h2>
                              <p className="mt-2 text-center text-sm text-gray-400">
                                  Enter the code from your authenticator app.
                              </p>
                              <form className="mt-8 space-y-6" onSubmit={handleTwoFactorSubmit}>
                                  <Input
                                      id="2fa-code"
                                      name="2fa-code"
                                      type="text"
                                      autoComplete="one-time-code"
                                      required
                                      placeholder="6-digit code"
                                      value={twoFactorCode}
                                      onChange={(e) => setTwoFactorCode(e.target.value)}
                                      disabled={isLoading}
                                      icon={<KeyRound className="w-5 h-5 text-gray-400" />}
                                      inputMode="numeric"
                                      pattern="\d{6}"
                                  />
                                  <div>
                                      <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                                          {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Verify'}
                                      </Button>
                                  </div>
                                   <p className="text-center text-sm text-gray-400">
                                      <button type="button" onClick={() => setIsTwoFactorStep(false)} className="font-medium text-blue-500 hover:text-blue-400">
                                          Back to login
                                      </button>
                                  </p>
                              </form>
                          </>
                      )}
                  </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;