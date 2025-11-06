import React, { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import DashboardHeader from '../components/DashboardHeader';
import { Gift, Copy, Share2, Star } from 'lucide-react';
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
                         <div className="bg-black text-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-800">
                            <div className="text-center">
                                <Gift className="mx-auto h-16 w-16 mb-4 text-purple-400" />
                                <h1 className="text-4xl font-extrabold">Refer Friends, Earn Rewards</h1>
                                <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                                    Love our services? Share the experience with your friends and get rewarded! For every friend who signs up and makes their first purchase using your unique referral code, you'll both receive exclusive benefits.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 mt-12 text-center">
                                {/* Step 1 */}
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                    <div className="text-3xl font-bold text-purple-400 mb-2">1</div>
                                    <h3 className="text-lg font-semibold mb-2">Share Your Code</h3>
                                    <p className="text-sm text-gray-400">Copy your unique referral code below and share it with your friends via social media, email, or text.</p>
                                </div>
                                {/* Step 2 */}
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                    <div className="text-3xl font-bold text-purple-400 mb-2">2</div>
                                    <h3 className="text-lg font-semibold mb-2">Friend Signs Up</h3>
                                    <p className="text-sm text-gray-400">Your friend uses your code during checkout on their first purchase to receive an instant discount.</p>
                                </div>
                                {/* Step 3 */}
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                    <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
                                    <h3 className="text-lg font-semibold mb-2">You Both Earn</h3>
                                    <p className="text-sm text-gray-400">Once their purchase is complete, we'll credit your account with ₹500 that you can use on future renewals or purchases.</p>
                                </div>
                            </div>
                            
                            <div className="mt-12 bg-gray-900/50 p-8 rounded-xl shadow-sm text-center border border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-300">Your Unique Referral Code</h2>
                                <div className="my-4 p-4 border-2 border-dashed border-gray-600 rounded-lg inline-flex items-center gap-4 bg-black">
                                    <span className="text-2xl font-bold text-white tracking-widest">{referralCode}</span>
                                    <Button onClick={copyToClipboard} variant="secondary" className="!py-2 !px-4 !bg-gray-700 hover:!bg-gray-600">
                                        <Copy size={16} className="mr-2" />
                                        Copy
                                    </Button>
                                </div>
                                <p className="text-gray-400">Share this code with your friends!</p>
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
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReferAndEarnPage;