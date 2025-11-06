import React from 'react';
import { Link } from 'react-router-dom';
import SeoMeta from '../components/SeoMeta';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Cloud, Globe, Layers, Smartphone, ShieldCheck, Cpu } from 'lucide-react';

interface Service {
    icon: React.ElementType;
    category: string;
    title: string;
    description: string;
    className: string;
    imageUrl?: string;
    path: string;
}

const servicesData: Service[] = [
  {
    icon: Cloud,
    category: 'HOSTING',
    title: 'Cloud Hosting',
    description: 'Scalable and reliable cloud hosting solutions for your websites and applications.',
    className: 'lg:col-span-1',
    path: '/services/cloud-hosting',
  },
  {
    icon: Globe,
    category: 'DOMAINS',
    title: 'Domain Registration',
    description: 'Find and register the perfect domain name for your business.',
    className: 'lg:col-span-1',
    path: '/services/domain-registration',
  },
  {
    icon: Layers,
    category: 'WEB DEV',
    title: 'Website Development',
    description: 'Custom website development tailored to your brand and business goals.',
    className: 'lg:col-span-2 lg:row-span-2',
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop',
    path: '/services/websites',
  },
  {
    icon: Smartphone,
    category: 'APP DEV',
    title: 'App Development',
    description: 'Native and cross-platform mobile application development services.',
    className: 'lg:col-span-2 lg:row-span-2',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
    path: '/services/mobile-apps',
  },
  {
    icon: ShieldCheck,
    category: 'SECURITY',
    title: 'Managed Security',
    description: 'Comprehensive security to protect your digital assets from threats.',
    className: 'lg:col-span-1',
    path: '/services/managed-security',
  },
  {
    icon: Cpu,
    category: 'AI/ML',
    title: 'AI Solutions',
    description: 'Integrate AI-powered tools and automations into your business workflow.',
    className: 'lg:col-span-1',
    path: '/services/ai-integration',
  },
];

const ServiceGridCard: React.FC<{ service: Service }> = ({ service }) => {
    const { icon: Icon, category, title, description, imageUrl, path } = service;
    const isLarge = !!imageUrl;

    return (
        <Link to={path} className="block group h-full">
            <div className="relative bg-[#1a1a2e] rounded-3xl border border-white/10 p-8 h-full transition-all duration-300 hover:border-cyan-400/50 hover:bg-[#202038] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] overflow-hidden">
                {isLarge && (
                    <>
                        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/70 to-transparent" />
                    </>
                )}
                <div className={`relative flex flex-col h-full ${isLarge ? 'justify-end' : ''}`}>
                    <div className="mb-4">
                        <Icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className={isLarge ? '' : 'flex-grow flex flex-col'}>
                        <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">{category}</p>
                        <h3 className="text-xl font-bold text-white mt-2">{title}</h3>
                        <p className="text-gray-300 mt-3 text-sm flex-grow">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};


const AllServicesOverviewPage: React.FC = () => {
    useScrollAnimation();
    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Services' }];

    return (
        <>
            <SeoMeta title="Our Services - ApexNucleus" description="Explore the comprehensive suite of digital solutions offered by ApexNucleus, including cloud hosting, domain registration, web and app development, security, and AI solutions." />
            <div className="relative text-white bg-[#0d0d1a] overflow-x-hidden">
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
                </div>
                <div className="relative z-10">
                    <div className="container mx-auto px-6 pt-40 pb-20">
                        <Breadcrumb crumbs={crumbs} className="mb-8 scroll-animate fade-in" />
                        <div className="text-center mb-16">
                            <h1 className="text-5xl font-extrabold scroll-animate slide-up">Our Services</h1>
                            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                                A complete ecosystem of digital solutions designed to elevate your brand and accelerate your growth.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-8">
                            {servicesData.map((service, index) => (
                                <div key={service.title} className={`${service.className} scroll-animate scale-up`} style={{ animationDelay: `${index * 100}ms`}}>
                                    <ServiceGridCard service={service} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AllServicesOverviewPage;
