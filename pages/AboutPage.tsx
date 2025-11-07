import React from 'react';
import SeoMeta from '../components/SeoMeta';
import Breadcrumb from '../components/ui/Breadcrumb';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Lightbulb, ShieldCheck, Users, Award, BookOpen, Target } from 'lucide-react';

// Data for the grid cards
interface AboutCardData {
    icon: React.ElementType;
    category: string;
    title: string;
    description: string;
    className: string;
    imageUrl?: string;
}

const aboutData: AboutCardData[] = [
  {
    icon: Lightbulb,
    category: 'VALUE',
    title: 'Innovation',
    description: 'We constantly explore new technologies and ideas to deliver cutting-edge solutions that drive progress.',
    className: 'lg:col-span-1',
  },
  {
    icon: ShieldCheck,
    category: 'VALUE',
    title: 'Integrity',
    description: 'We operate with transparency and honesty, building trust through every interaction with our clients and partners.',
    className: 'lg:col-span-1',
  },
  {
    icon: BookOpen,
    category: 'OUR JOURNEY',
    title: 'Our Story',
    description: 'Founded by Roshan Kumar Pandey, ApexNucleus began with a vision to make powerful digital tools accessible to all businesses. We are your trusted partner in digital innovation, crafting bespoke solutions that empower businesses to scale, innovate, and lead.',
    className: 'lg:col-span-2 lg:row-span-2',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: Target,
    category: 'OUR PURPOSE',
    title: 'Our Mission',
    description: 'To empower businesses of all sizes to thrive in the digital landscape by providing innovative, reliable, and scalable web and cloud solutions. We are committed to turning complex challenges into simple, elegant realities for our clients.',
    className: 'lg:col-span-2 lg:row-span-2',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: Users,
    category: 'VALUE',
    title: 'Partnership',
    description: 'We succeed when our clients succeed. We work as an extension of your team to achieve shared goals.',
    className: 'lg:col-span-1',
  },
  {
    icon: Award,
    category: 'VALUE',
    title: 'Excellence',
    description: 'We are committed to the highest standards of quality in everything we do, from code to customer service.',
    className: 'lg:col-span-1',
  },
];

// Card component, styled like ServiceGridCard from AllServicesOverviewPage
const AboutGridCard: React.FC<{ card: AboutCardData }> = ({ card }) => {
    const { icon: Icon, category, title, description, imageUrl } = card;
    const isLarge = !!imageUrl;

    return (
        <div className="group h-full">
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
        </div>
    );
};


const AboutPage: React.FC = () => {
    useScrollAnimation();
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'About Us' },
    ];

    return (
        <>
            <SeoMeta
                title="About Us - ApexNucleus"
                description="Learn about the mission, vision, and values that drive ApexNucleus, a leading provider of web and cloud solutions."
            />
            <div className="relative text-white bg-[#0d0d1a] overflow-x-hidden">
                 <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
                </div>
                <div className="relative z-10">
                    <div className="container mx-auto px-6 pt-40 pb-20">
                        <Breadcrumb crumbs={crumbs} className="mb-8 scroll-animate fade-in" />
                        <div className="text-center mb-16">
                            <h1 className="text-5xl font-extrabold scroll-animate slide-up">About ApexNucleus</h1>
                            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                                The story, mission, and values that define our commitment to digital excellence.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-8">
                            {aboutData.map((card, index) => (
                                <div key={card.title} className={`${card.className} scroll-animate scale-up`} style={{ animationDelay: `${index * 100}ms`}}>
                                    <AboutGridCard card={card} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutPage;
