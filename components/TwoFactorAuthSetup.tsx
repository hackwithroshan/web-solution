import React, { useState, useEffect } from 'react';
import * as QRCode from 'qrcode';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Input from './ui/Input';
import Button from './ui/Button';
import { Loader, X, ShieldCheck, Copy } from 'lucide-react';

interface TwoFactorAuthSetupProps {
    onClose: () => void;
    onStateChange: (isEnabled: boolean) => void;
}

const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({ onClose, onStateChange }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [step, setStep] = useState(user?.twoFactorEnabled ? 'manage' : 'generate');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (step === 'generate') {
            const generateSecret = async () => {
                setIsLoading(true);
                try {
                    const data = await generateTwoFactorSecret();
                    setSecret(data.secret);
                    const qrUrl = await QRCode.toDataURL(data.qrCodeUrl);
                    setQrCodeDataUrl(qrUrl);
                    setStep('scan');
                } catch (error: any) {
                    addToast(error.message || 'Could not start 2FA setup.', 'error');
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            generateSecret();
        }
    }, [step, addToast, onClose]);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        addToast(`${type} copied to clipboard!`, 'success');
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await enableTwoFactor(verificationCode);
            setRecoveryCodes(data.recoveryCodes);
            addToast('2FA enabled successfully!', 'success');
            setStep('recover');
            onStateChange(true);
        } catch (error: any) {
            addToast(error.message || 'Verification failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await disableTwoFactor(password, verificationCode);
            addToast('2FA disabled successfully.', 'success');
            onStateChange(false);
            onClose();
        } catch (error: any) {
             addToast(error.message || 'Failed to disable 2FA.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-md relative animate-slide-in-up">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="p-6">
                    {step === 'generate' && <div className="h-64 flex justify-center items-center"><Loader className="animate-spin" /></div>}
                    
                    {step === 'scan' && (
                        <>
                            <h2 className="text-xl font-bold mb-2">Set Up Authenticator App</h2>
                            <p className="text-sm text-gray-600 mb-4">Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                            <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                                {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt="2FA QR Code" /> : <Loader className="animate-spin" />}
                            </div>
                            <p className="text-xs text-gray-500 text-center my-2">Or enter this code manually:</p>
                            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <span className="font-mono text-sm flex-grow">{secret}</span>
                                <button onClick={() => copyToClipboard(secret, 'Secret')} className="text-gray-500 hover:text-gray-800"><Copy size={16} /></button>
                            </div>
                             <form onSubmit={handleVerify} className="mt-4">
                                <Input label="Verification Code" type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required inputMode="numeric" pattern="\d{6}" placeholder="Enter 6-digit code" variant="light"/>
                                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                                    {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Verify & Enable'}
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 'recover' && (
                        <>
                            <h2 className="text-xl font-bold mb-2 flex items-center"><ShieldCheck className="text-green-500 mr-2"/> 2FA Enabled!</h2>
                            <p className="text-sm text-gray-600 mb-4">Save these recovery codes in a safe place. They can be used to access your account if you lose your device.</p>
                            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                                {recoveryCodes.map(code => (
                                    <span key={code} className="block font-mono text-center text-lg">{code}</span>
                                ))}
                            </div>
                            <Button onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'Recovery codes')} className="w-full mt-4" variant="secondary">
                                <Copy size={16} className="mr-2"/> Copy Codes
                            </Button>
                            <Button onClick={onClose} className="w-full mt-2">Done</Button>
                        </>
                    )}

                    {step === 'manage' && (
                         <>
                            <h2 className="text-xl font-bold mb-4">Disable Two-Factor Authentication</h2>
                             <form onSubmit={handleDisable} className="space-y-4">
                                 <p className="text-sm text-gray-600">To disable 2FA, please enter your password and a code from your authenticator app.</p>
                                 <Input label="Current Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required variant="light"/>
                                 <Input label="Authentication Code" type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required inputMode="numeric" pattern="\d{6}" placeholder="6-digit code" variant="light"/>
                                <Button type="submit" className="w-full mt-4 !bg-red-600 hover:!bg-red-700" disabled={isLoading}>
                                    {isLoading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Disable 2FA'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuthSetup;