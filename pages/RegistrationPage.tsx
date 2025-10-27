import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sendRegistrationOtp } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, User, Mail, Lock, Building, Phone, MapPin, FileText, KeyRound, UserPlus } from 'lucide-react';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import { useToast } from '../hooks/useToast';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';

const AuthGraphic: React.FC = () => (
  <div className="hidden lg:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
    <div 
        className="absolute w-64 h-64 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full animate-float-3d auth-graphic-orb"
        style={{ filter: 'blur(30px)'}}
    ></div>
    <UserPlus className="w-24 h-24 text-blue-400 mb-6 relative z-10" />
    <h1 className="text-3xl font-bold mb-4 text-center relative z-10">Build Your Digital Future</h1>
    <p className="text-center text-gray-300 max-w-sm relative z-10">
      Join ApexNucleus today to access powerful hosting, development, and AI solutions.
    </p>
  </div>
);

const RegistrationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const { register, isLoading, user } = useAuth();
  const { addToast } = useToast();
  
  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with 'number' for browser environment.
    let timer: number;
    if (resendTimer > 0) {
      timer = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const validateEmail = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { newErrors.email = 'Email address is required.'; isValid = false; } 
    else if (!emailRegex.test(email)) { newErrors.email = 'Please enter a valid email address.'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!otp.trim() || otp.length !== 6) { newErrors.otp = 'Please enter the 6-digit code.'; isValid = false; }
    if (!name.trim()) { newErrors.name = 'Full Name is required.'; isValid = false; }
    if (!password) { newErrors.password = 'Password is required.'; isValid = false; } 
    else if (password.length < 8) { newErrors.password = 'Password must be at least 8 characters long.'; isValid = false; }
    if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; isValid = false; }
    if (!phone.trim()) { newErrors.phone = 'Phone number is required.'; isValid = false; }
    if (!address.trim()) { newErrors.address = 'Address is required.'; isValid = false; }
    if (!agreed) { newErrors.agreed = 'You must agree to the terms and conditions.'; isValid = false; }
    
    setErrors(newErrors);
    return isValid;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsSendingOtp(true);
    try {
      await sendRegistrationOtp(email);
      addToast('Verification code sent to your email!', 'success');
      setStep(2);
      setResendTimer(60);
    } catch (error: any) {
      addToast(error.message || 'Failed to send code.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };
  
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsSendingOtp(true);
    try {
        await sendRegistrationOtp(email);
        addToast('A new verification code has been sent.', 'success');
        setResendTimer(60);
    } catch (error: any) {
        addToast(error.message || 'Failed to resend code.', 'error');
    } finally {
        setIsSendingOtp(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      await register(name, email, password, phone, address, otp, companyName, gstNumber);
    }
  };

  useEffect(() => {
    if (user) { navigate('/user/dashboard', { replace: true }); }
  }, [user, navigate]);

  return (
    <>
      <SeoMeta
        title="Create Account - ApexNucleus"
        description="Join ApexNucleus today to access powerful hosting, development, and AI solutions for your business."
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
               <div className="flex items-center justify-center p-8 md:p-10 order-2 lg:order-1">
                  <div className="w-full max-w-md">
                      <div className="flex justify-center mb-4">
                          <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_200/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-8 w-auto" />
                      </div>
                      <h2 className="text-center text-3xl font-bold text-white">
                          Create Your Account
                      </h2>
                       <p className="mt-2 text-center text-sm text-gray-400">
                          Step {step} of 2: {step === 1 ? 'Verify Your Email' : 'Complete Your Profile'}
                      </p>

                       <div className="mt-4 w-full bg-gray-600 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                      </div>

                      <form className="mt-8 space-y-4" onSubmit={step === 1 ? handleSendCode : handleSubmit}>
                          {step === 1 && (
                              <>
                                  <Input id="email-address" name="email" type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSendingOtp} icon={<Mail className="w-5 h-5 text-gray-400" />}/>
                                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                                  <div className="pt-4">
                                      <Button type="submit" className="w-full justify-center" disabled={isSendingOtp}>
                                          {isSendingOtp ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Send Verification Code'}
                                      </Button>
                                  </div>
                              </>
                          )}

                          {step === 2 && (
                               <>
                                  <Input id="email-address" name="email" type="email" value={email} disabled icon={<Mail className="w-5 h-5 text-gray-400" />}/>
                                  
                                  <Input id="otp" name="otp" type="text" required placeholder="6-Digit Verification Code" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isLoading} icon={<KeyRound className="w-5 h-5 text-gray-400" />}/>
                                  {errors.otp && <p className="text-red-400 text-xs">{errors.otp}</p>}
                                  <div className="text-right text-sm">
                                      <button type="button" onClick={handleResendCode} disabled={resendTimer > 0 || isSendingOtp} className="font-medium text-blue-500 hover:text-blue-400 disabled:text-gray-400 disabled:cursor-not-allowed">
                                          {isSendingOtp ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                      </button>
                                  </div>

                                  <hr className="border-gray-600 my-4" />

                                  <Input id="full-name" name="name" type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} icon={<User className="w-5 h-5 text-gray-400" />}/>
                                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}

                                  <div>
                                      <Input id="password" name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} icon={<Lock className="w-5 h-5 text-gray-400" />}/>
                                      <PasswordStrengthMeter password={password} />
                                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                  </div>
                                  
                                  <Input id="confirm-password" name="confirm-password" type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} icon={<Lock className="w-5 h-5 text-gray-400" />}/>
                                  {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                                  
                                  <Input id="phone" name="phone" type="tel" required placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} icon={<Phone className="w-5 h-5 text-gray-400" />}/>
                                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}

                                  <Input id="address" name="address" type="text" required placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} icon={<MapPin className="w-5 h-5 text-gray-400" />}/>
                                  {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}

                                  <Input id="companyName" name="companyName" type="text" placeholder="Company Name (Optional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isLoading} icon={<Building className="w-5 h-5 text-gray-400" />}/>
                                  
                                  <Input id="gstNumber" name="gstNumber" type="text" placeholder="GST Number (Optional)" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} disabled={isLoading} icon={<FileText className="w-5 h-5 text-gray-400" />}/>

                                  <div className="flex items-start pt-2">
                                      <div className="flex items-center h-5">
                                          <input id="terms" name="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-500 rounded bg-gray-700"/>
                                      </div>
                                      <div className="ml-3 text-sm">
                                          <label htmlFor="terms" className="font-medium text-gray-300">
                                          I agree to the <a href="#" className="text-blue-500 hover:underline">Terms</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                                          </label>
                                          {errors.agreed && <p className="text-red-400 text-xs mt-1">{errors.agreed}</p>}
                                      </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-4">
                                      <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                                          Back
                                      </Button>
                                      <Button type="submit" className="justify-center" disabled={isLoading}>
                                          {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Create Account'}
                                      </Button>
                                  </div>
                              </>
                          )}
                          
                           <p className="text-center text-sm text-gray-400 pt-2">
                              Already have an account?{' '}
                              <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                                  Sign In
                              </Link>
                          </p>
                      </form>
                  </div>
              </div>
              <div className="order-1 lg:order-2">
                  <AuthGraphic />
              </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationPage;