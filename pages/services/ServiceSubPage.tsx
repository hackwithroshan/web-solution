import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoMeta from '../../components/SeoMeta';
import RippleGrid from '../../components/RippleGrid';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { ArrowLeft } from 'lucide-react';

const ServiceSubPage: React.FC = () => {
    const { serviceName } = useParams<{ serviceName: string }>();
    const title = serviceName?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service';

    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: title },
    ];

    return (
        <>
            <SeoMeta
                title={`${title} - ApexNucleus Services`}
                description={`Learn more about our ${title} services.`}
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
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold">{title}</h1>
                            <p className="mt-4 text-lg text-gray-300">
                                Coming Soon! We're putting the finishing touches on this page.
                            </p>
                             <Link to="/services" className="inline-flex items-center text-blue-400 hover:text-blue-300 mt-8">
                                <ArrowLeft size={16} className="mr-2" /> Back to All Services
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceSubPage;