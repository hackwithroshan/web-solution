import React from 'react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';

const TermsAndConditionsPage: React.FC = () => {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Terms & Conditions' },
    ];
    
    const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <SeoMeta
                title="Terms & Conditions - ApexNucleus"
                description="Read the terms and conditions for using ApexNucleus services."
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
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">Terms & Conditions</h1>
                            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6">
                                <p><strong>Company Name:</strong> ApexNucles (referred to herein as "we," "us," or the "Company")</p>
                                <p><strong>Effective Date:</strong> {effectiveDate}</p>
                                <p>By using our services, you agree to be bound by these Terms and Conditions.</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">1. Service Provision</h2>
                                <p>ApexNucles provides IT Services, Web Hosting, Domain Registration/Renewal, and Digital Marketing services. All services are subject to a separate Service Agreement or Order Form.</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">2. Payments and Autopay (Automatic Payment)</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Pricing:</strong> Applicable fees for services are listed on our website or in the service agreement and are subject to change without prior notice.</li>
                                    <li><strong>Payment:</strong> All payments are due in advance. You can pay using credit/debit cards, net banking, or other accepted methods.</li>
                                    <li><strong>Autopay Consent:</strong> To ensure service continuity, you acknowledge and agree that your services will be automatically renewed.</li>
                                    <li>The renewal fee will be automatically charged to your registered payment method prior to the renewal date.</li>
                                    <li>To disable the Autopay feature, you must notify us in writing at least [7] days before the scheduled renewal date.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">3. Domain and Hosting</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Registration/Renewal:</strong> Domain name registration and renewal are final and subject to the policies of the Domain Registrar.</li>
                                    <li><strong>Late Renewal:</strong> Failure to timely renew a domain may lead to its suspension or loss.</li>
                                    <li><strong>Acceptable Use Policy (AUP):</strong> You agree to abide by our AUP regarding hosting usage, prohibiting illegal or harmful content.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">4. Digital Marketing Services</h2>
                                <p>ApexNucles makes no guarantees regarding the results of Digital Marketing services (such as rankings, traffic, or leads), as these outcomes depend on search engine and social media platform policies outside our control.</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">5. Termination of Service</h2>
                                <p>We reserve the right, in our sole discretion, to immediately terminate or suspend any user’s service without prior notice or liability if the user breaches these Terms and Conditions.</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">6. Disclaimer of Warranty and Limitation of Liability</h2>
                                <p>Our services are provided on an "as is" and "as available" basis. ApexNucles will not be liable for any indirect, incidental, special, punitive, or consequential damages.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TermsAndConditionsPage;