import React, { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Gift, Copy, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

const ReferAndEarnPage: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { addToast } = useToast();
    const referralCode = "APEX123XYZ"; // This would come from the user object

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        addToast("Referral code copied to clipboard!", "success");
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="relative flex-1 flex flex-col overflow-hidden lg:ml-64">
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                         <div className="text-center bg-gradient-to-r from-purple-600 to-blue-500 text-white p-10 rounded-xl shadow-lg">
                            <Gift className="mx-auto h-16 w-16 mb-4" />
                            <h1 className="text-4xl font-extrabold">Refer & Earn</h1>
                            <p className="mt-2 text-lg opacity-90 max-w-2xl mx-auto">
                                Share your referral code with friends and earn credits when they purchase their first service!
                            </p>
                        </div>

                        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm text-center">
                            <h2 className="text-lg font-semibold text-gray-700">Your Unique Referral Code</h2>
                            <div className="my-4 p-4 border-2 border-dashed border-gray-300 rounded-lg inline-flex items-center gap-4">
                                <span className="text-2xl font-bold text-gray-800 tracking-widest">{referralCode}</span>
                                <Button onClick={copyToClipboard} variant="secondary" className="!py-2 !px-4">
                                    <Copy size={16} className="mr-2" />
                                    Copy
                                </Button>
                            </div>
                            <p className="text-gray-500">Share this code with your friends!</p>
                            <div className="mt-6 flex justify-center gap-4">
                                <Button className="flex items-center !bg-green-500 hover:!bg-green-600">
                                    <Share2 size={16} className="mr-2" /> Share on WhatsApp
                                </Button>
                                <Button className="flex items-center !bg-blue-800 hover:!bg-blue-900">
                                     <Share2 size={16} className="mr-2" /> Share on Facebook
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReferAndEarnPage;