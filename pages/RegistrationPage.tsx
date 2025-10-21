import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Loader, User, Mail, Lock, Building, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';

const AuthGraphic: React.FC = () => (
  <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#3A0066] to-[#1E1E2C] p-12 text-white">
    <Building className="w-24 h-24 text-blue-400 mb-6" />
    <h1 className="text-3xl font-bold mb-4 text-center">Build Your Digital Future</h1>
    <p className="text-center text-gray-300 max-w-sm">
      Join ApexNucleus today to access powerful hosting, development, and AI solutions.
    </p>
  </div>
);

const RegistrationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { register, isLoading, user } = useAuth();

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!name.trim()) { newErrors.name = 'Full Name is required.'; isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { newErrors.email = 'Email address is required.'; isValid = false; } 
    else if (!emailRegex.test(email)) { newErrors.email = 'Please enter a valid email address.'; isValid = false; }
    if (!password) { newErrors.password = 'Password is required.'; isValid = false; } 
    else if (password.length < 8) { newErrors.password = 'Password must be at least 8 characters long.'; isValid = false; }
    if (password !== confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; isValid = false; }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    if (!phone.trim()) { newErrors.phone = 'Phone number is required.'; isValid = false; }
    if (!address.trim()) { newErrors.address = 'Address is required.'; isValid = false; }
    if (!agreed) { newErrors.agreed = 'You must agree to the terms and conditions.'; isValid = false; }
    
    setErrors(newErrors);
    return isValid;
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handleBack = () => {
      setStep(1);
      setErrors(prev => {
        const { phone, address, agreed, ...rest } = prev;
        return rest;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      await register(name, email, password, phone, address, companyName, gstNumber);
    }
  };

  useEffect(() => {
    if (user) { navigate('/user/dashboard', { replace: true }); }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex bg-[#1E1E2C]">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center justify-center p-4">
             <div className="flex items-center justify-center order-2 lg:order-1">
                <div className="w-full max-w-md bg-[#2A2A3A] p-8 md:p-10 rounded-2xl shadow-2xl">
                    <div className="flex justify-center mb-4">
                        <img src="https://res.cloudinary.com/dvrqft9ov/image/upload/v1760926899/Untitled_design_10_kf8buw.png" alt="ApexNucleus Logo" className="h-8 w-auto" />
                    </div>
                    <h2 className="text-center text-3xl font-bold text-white">
                        Create Your Account
                    </h2>
                     <p className="mt-2 text-center text-sm text-gray-400">
                        Step {step} of 2: {step === 1 ? 'Account Details' : 'Contact Information'}
                    </p>

                     <div className="mt-4 w-full bg-gray-600 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={step === 1 ? handleNext : handleSubmit}>
                        {step === 1 && (
                            <>
                                <Input id="full-name" name="name" type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} icon={<User className="w-5 h-5 text-gray-400" />}/>
                                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}

                                <Input id="email-address" name="email" type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} icon={<Mail className="w-5 h-5 text-gray-400" />}/>
                                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                                
                                <div>
                                    <Input id="password" name="password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} icon={<Lock className="w-5 h-5 text-gray-400" />}/>
                                    <PasswordStrengthMeter password={password} />
                                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                </div>
                                
                                <Input id="confirm-password" name="confirm-password" type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} icon={<Lock className="w-5 h-5 text-gray-400" />}/>
                                {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}

                                <div className="pt-4">
                                    <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                                        Next Step <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                             <>
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
                                    <Button type="button" variant="secondary" onClick={handleBack}>
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
  );
};

export default RegistrationPage;