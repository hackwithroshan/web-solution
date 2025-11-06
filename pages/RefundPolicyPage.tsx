import React from 'react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';

const RefundPolicyPage: React.FC = () => {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Refund Policy' },
    ];
    
    const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <SeoMeta
                title="Refund Policy - ApexNucleus"
                description="Read the refund policy for ApexNucleus services."
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
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">Refund Policy</h1>
                            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6">
                                <p><strong>Company Name:</strong> ApexNucles (referred to herein as "we," "us," or the "Company")</p>
                                <p><strong>Effective Date:</strong> {effectiveDate}</p>
                                <p>ApexNucles is committed to ensuring the quality of its services. Our refund policy varies depending on the type of service purchased:</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">1. IT Services (Software Development, Custom Services)</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Full Refund:</strong> A full refund may be issued if you request cancellation in writing before the project commencement.</li>
                                    <li><strong>Partial Refund:</strong> If the project has begun, a partial refund will be issued only for the incomplete work. Fees for completed work (including labour, time, and materials) will be deducted.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">2. Web Hosting</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>30-Day Money-Back Guarantee:</strong> New hosting services are eligible for a full refund within the first 30 days if you are not satisfied (excluding domain registration fees and third-party charges).</li>
                                    <li><strong>Renewals:</strong> No refunds are issued for service renewals unless you request cancellation in writing [5] days prior to the renewal date.</li>
                                </ul>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">3. Domain Registration and Renewal</h2>
                                <p>Domain name registration and renewal fees are Non-Refundable. Once a domain is registered or renewed, ApexNucles cannot cancel it with the registrar.</p>
                                
                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">4. Digital Marketing Services (SEO, SMO, PPC, etc.)</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Monthly Retainers:</strong> There are no refunds for monthly digital marketing plans. You may cancel the service by providing 15 days' written notice before the next billing cycle begins.</li>
                                    <li><strong>Setup Fees:</strong> Any initial setup fee charged is non-refundable.</li>
                                </ul>
                                
                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">5. Autopay/Duplicate Payment</h2>
                                <p>If a duplicate payment occurs accidentally due to the Autopay system, the excess amount will be refunded within 15–20 business days upon verification.</p>

                                <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">6. Refund Process</h2>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>All refund requests must be submitted in writing to support@apexnucles.com.</li>
                                    <li>Approved refunds will be processed back to the original method of payment within 15 to 20 business days.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundPolicyPage;
