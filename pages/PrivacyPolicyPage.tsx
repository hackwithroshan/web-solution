import React from 'react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';

const PrivacyPolicyPage: React.FC = () => {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy' },
    ];
    
    const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <SeoMeta
                title="Privacy Policy - ApexNucleus"
                description="Read the privacy policy for ApexNucleus."
            />
            <div className="relative text-white bg-[#1E1E2C] overflow-x-hidden">
                <div className="fixed inset-0 z-0">
                    <RippleGrid
                        gridColor="#252535"
                        rippleIntensity={0.02}
                        gridSize={20}
                        gridThickness={20}
                        mouseInteraction={true}
                        mouseInteractionRadius={1.2}
                        opacity={0.8}
                    />
                </div>
                <div className="relative z-10">
                    <div className="container mx-auto px-6 pt-40 pb-20">
                        <Breadcrumb crumbs={crumbs} className="mb-8" />
                        <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">Privacy Policy</h1>
                            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6">
                                <p><strong>Company Name:</strong> ApexNucles (referred to herein as "we," "us," or the "Company")</p>
                                <p><strong>Effective Date:</strong> {effectiveDate}</p>
                                <p>ApexNucles values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
                                
                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">1. Information We Collect</h2>
                                <p>We primarily collect two types of information:</p>
                                <h3 className="text-xl font-semibold text-white">Personally Identifiable Information (PII):</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Name, email address, phone number, and billing address.</li>
                                    <li>Payment Information: Details required to process transactions (like credit/debit card numbers or bank details). This information is securely handled by our third-party payment gateway partners; we do not directly store sensitive financial data.</li>
                                    <li>Account login credentials (stored in encrypted form).</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-white">Non-Personal Information:</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Website usage data, IP address, browser type, operating system.</li>
                                    <li>Information collected via Cookies and tracking technologies.</li>
                                    <li>Details of services purchased, domain names, and hosting plans.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">2. How We Use Your Information</h2>
                                <p>We use your information for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>To provide, manage, and maintain IT Services, Hosting, Domain Registration/Renewal, and Digital Marketing services.</li>
                                    <li>To process your transactions and issue bills for services.</li>
                                    <li>To facilitate automatic renewals of services via the Autopay System.</li>
                                    <li>To respond to your customer support requests.</li>
                                    <li>To send you information about our services, promotions, and new offers.</li>
                                    <li>To improve our website and service offerings.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">3. Disclosure of Information</h2>
                                <p>We do not sell or rent your personal information to third parties. However, we may share information with:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Secure Payment Gateway partners for processing payments and managing the Autopay function.</li>
                                    <li>Domain Registrars for the purpose of registering and managing domain names.</li>
                                    <li>To comply with legal requirements or protect our rights and property.</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">4. Security</h2>
                                <p>We implement reasonable security measures to protect your personal information from unauthorized access and disclosure.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicyPage;