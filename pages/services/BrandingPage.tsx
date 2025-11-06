import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import SeoMeta from '../../components/SeoMeta';
import RippleGrid from '../../components/RippleGrid';
import { LogoLoop } from '../../components/LogoLoop';
import TestimonialScroller from '../../components/TestimonialScroller';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
    ArrowRight, Star, Target, Palette, MonitorSmartphone, Puzzle, Sparkles, 
    HeartHandshake, Rocket, Megaphone, Zap, Users, CheckCircle, BrainCircuit,
    Building, Gem, Plane, ConciergeBell, Hospital, Home, Landmark, ChevronDown, ChevronUp, Briefcase
} from 'lucide-react';

const FAQItem: React.FC<{ question: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }> = ({ question, children, isOpen, onClick }) => (
    <div className="border-b border-white/10">
        <button onClick={onClick} className="w-full flex justify-between items-center text-left py-5 px-6">
            <span className="font-semibold text-lg">{question}</span>
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="pb-5 px-6 text-gray-300">{children}</div>
        </div>
    </div>
);

const BrandingPage: React.FC = () => {
    useScrollAnimation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: 'Branding' }];

    const techLogos = [
        { node: <span className="font-bold text-xl text-gray-400">Next.js</span>, title: "Next.js" },
        { node: <span className="font-bold text-xl text-gray-400">Webflow</span>, title: "Webflow" },
        { node: <span className="font-bold text-xl text-gray-400">Canva</span>, title: "Canva" },
        { node: <span className="font-bold text-xl text-gray-400">Figma</span>, title: "Figma" },
        { node: <span className="font-bold text-xl text-gray-400">OpenAI</span>, title: "OpenAI" },
    ];

    const testimonials = [
        { 
            quote: "I recently had the privilege of working with ApexNucleus for a full website, SEO and social media overhaul. I had tried working with different companies for each of these services in the past and was never fully satisfied, but ApexNucleus was able to solve all my problems at one place.",
            name: "Arpit Sharma",
            title: "Sevenseas Spa",
            company: "",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        { 
            quote: "The team was very responsive and patient with all of my questions and requests. My website traffic has increased by at least 50%, my SEO rankings have improved significantly, and my social media presence is now much stronger.",
            name: "Emily Pearson",
            title: "Portfolio Manager",
            company: "Eltcon Builders, Australia",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        { 
            quote: "The team was very responsive and patient with all of my questions and requests. My website traffic has increased by at least 50%, my SEO rankings have improved significantly, and my social media presence is now much stronger.",
            name: "Mathias",
            title: "Director",
            company: "Vizual Consulting LLC",
            avatar: "https://randomuser.me/api/portraits/men/46.jpg"
        },
    ];

    const faqs = [
        { question: "How long does the branding process take?", answer: "The timeline for a branding project can vary depending on the scope and complexity. A basic logo and style guide might take a few weeks, while a comprehensive brand strategy and identity overhaul can take several months. We'll provide a detailed timeline after our initial discovery phase." },
        { question: "Can you rebrand an existing business?", answer: "Absolutely. We specialize in both creating new brands from scratch and revitalizing existing ones. Our rebranding process involves analyzing your current brand equity, identifying market opportunities, and developing a new identity that aligns with your future goals." },
        { question: "What if I only need a logo design?", answer: "While we advocate for a holistic branding approach, we do offer standalone logo design services. Our process still involves understanding your business and target audience to ensure the logo is effective and memorable." },
        { question: "How much do your branding services cost?", answer: "Our pricing is tailored to the specific needs of each client. After an initial consultation to understand your requirements, we will provide a detailed proposal with a transparent breakdown of costs. We offer packages for various budgets, from startups to established enterprises." },
    ];

    return (
        <>
            <SeoMeta title="Branding Services - ApexNucleus" description="Amaze your audience with a compelling Brand Identity. ApexNucleus offers expert branding services designed to help businesses craft unique and compelling brand identities." />
            <div className="relative text-white bg-slate-900 overflow-x-hidden">
                <div className="fixed inset-0 z-0 opacity-50"><RippleGrid gridColor="#475569" /></div>
                
                <div className="relative z-10">
                    {/* Hero Section */}
                    <section className="pt-40 pb-20">
                        <div className="container mx-auto px-6">
                            <Breadcrumb crumbs={crumbs} className="mb-8 scroll-animate fade-in" />
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="scroll-animate slide-up">
                                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">Branding</h1>
                                    <h2 className="text-2xl mt-4 text-cyan-400">Amaze your audience with a compelling Brand Identity</h2>
                                    <p className="mt-6 text-lg text-gray-300">In today's competitive market, effective branding is essential for businesses seeking to distinguish themselves and create lasting impressions. At ApexNucleus, our expert branding services are designed to help businesses craft unique and compelling brand identities that resonate with their target audience.</p>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
                                        <Link to="/case-studies" className="text-white font-semibold flex items-center gap-2 hover:text-cyan-400 transition-colors"><ArrowRight className="w-5 h-5 bg-cyan-500 rounded-full p-1" /> Award Winning Branding Kit</Link>
                                        <Link to="/success-stories" className="text-white font-semibold flex items-center gap-2 hover:text-cyan-400 transition-colors"><ArrowRight className="w-5 h-5 bg-cyan-500 rounded-full p-1" /> Proven Success Stories</Link>
                                    </div>
                                    <Button className="mt-8">Get Quote</Button>
                                </div>
                                <div className="hidden md:flex justify-center items-center scroll-animate scale-up delay-200">
                                    <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-br from-cyan-900 via-slate-900 to-purple-900 p-4">
                                        <div className="w-full h-full rounded-full border-2 border-dashed border-white/20 animate-spin-slow flex items-center justify-center">
                                            <Palette className="w-24 h-24 text-cyan-400 opacity-80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Blue Info Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-8 md:p-12 text-center text-white scroll-animate fade-in">
                                <h2 className="text-3xl font-bold">Delivering stunning designs for over a decade</h2>
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <span className="font-semibold">Clutch</span>
                                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />)}</div>
                                    <span className="font-bold">(4.95)</span>
                                </div>
                                <p className="mt-4 max-w-3xl mx-auto text-blue-100">Great designs are the perfect way to attract business for your brand, and ApexNucleus's designers provide you with the best and most innovatively designed website. Good website design is the most impactful and authoritative marketing tool for your brand's success.</p>
                            </div>
                        </div>
                    </section>

                    {/* Branding Services Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-12 scroll-animate slide-up">
                                <h2 className="text-4xl font-bold">Branding Services We Offer</h2>
                            </div>
                            <div className="mb-12 scroll-animate fade-in"><LogoLoop logos={techLogos} speed={60} /></div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { icon: Target, title: "Brand Strategy Development", services: ["Market Research and Analysis", "Brand Positioning", "Brand Messaging"] },
                                    { icon: Palette, title: "Visual Identity Design", services: ["Logo Design", "Colors and Typography", "Brand Style Guide"] },
                                    { icon: MonitorSmartphone, title: "Digital Branding", services: ["Website Design", "Social Media Branding", "Content Creation"] },
                                    { icon: Puzzle, title: "Brand Experience", services: ["Customer Journey Mapping", "Brand Touchpoints", "Packaging Design"] }
                                ].map((item, index) => (
                                    <div key={item.title} className={`bg-slate-800/50 border border-white/10 p-6 rounded-lg scroll-animate scale-up delay-${index*100}`}>
                                        <item.icon className="w-10 h-10 text-cyan-400 mb-4" />
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                                            {item.services.map(s => <li key={s}>{s}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Why You Need Branding Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="grid lg:grid-cols-3 gap-12 items-start">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="scroll-animate slide-up">
                                        <h2 className="text-3xl font-bold">Why You Need Branding for Your Business</h2>
                                        <p className="mt-4 text-gray-300">In today's competitive market, branding is more than just a logo or a catchy tagline. It's about creating a cohesive and memorable identity that reflects your business's values, mission, and promise to your customers.</p>
                                    </div>
                                    {[
                                        { icon: Sparkles, title: "Differentiate Your Business", desc: "Stand out in a crowded marketplace." },
                                        { icon: HeartHandshake, title: "Build Trust and Loyalty", desc: "Cultivate a strong, loyal customer base." },
                                        { icon: Rocket, title: "Drive Customer Engagement", desc: "Enhance customer experiences and interactions." },
                                        { icon: Megaphone, title: "Boost Your Marketing Efforts", desc: "Amplify the effectiveness of your marketing campaigns." }
                                    ].map((item, index) => (
                                        <div key={item.title} className={`flex items-start gap-4 p-6 bg-slate-800/50 border border-white/10 rounded-lg scroll-animate slide-up delay-${(index+1)*100}`}>
                                            <div className="p-3 bg-slate-700 rounded-full"><item.icon className="w-6 h-6 text-cyan-400" /></div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                                <p className="text-gray-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="sticky top-28 bg-slate-800/50 border border-white/10 p-8 rounded-lg scroll-animate fade-in delay-300">
                                    <h3 className="text-xl font-bold text-center">Let's start your project together</h3>
                                    <form className="mt-6 space-y-4">
                                        <Input name="name" placeholder="Full Name" />
                                        <Input name="email" type="email" placeholder="Email" />
                                        <Input name="phone" type="tel" placeholder="Telephone" />
                                        <textarea placeholder="Message" rows={4} className="w-full border shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 py-3 bg-[#3A3A4A] text-gray-200 border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-4"></textarea>
                                        <Button className="w-full">Submit</Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Industries Section */}
                    <section className="py-20 relative overflow-hidden bg-slate-900">
                        <div 
                            className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-cyan-900/50"
                            style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0% 100%)' }}
                        ></div>
                        <div className="container mx-auto px-6 relative">
                            <div className="text-center mb-12 scroll-animate slide-up">
                                <h2 className="text-4xl font-bold">Industries we serve</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-center">
                                {[
                                    { icon: Briefcase, label: 'Consulting' }, { icon: BrainCircuit, label: 'Education' },
                                    { icon: Gem, label: 'Cryptocurrency' }, { icon: ConciergeBell, label: 'Hospitality' },
                                    { icon: Plane, label: 'Fashion' }, { icon: Hospital, label: 'Healthcare' },
                                    { icon: Building, label: 'B2B' }, { icon: Home, label: 'Real Estate' },
                                    { icon: Users, label: 'Logistics' }, { icon: Landmark, label: 'Finance' }
                                ].map((item, index) => (
                                    <div key={item.label} className={`flex flex-col items-center gap-3 scroll-animate scale-up delay-${index*50}`}>
                                        <item.icon className="w-8 h-8 text-cyan-400" />
                                        <span className="font-semibold">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Testimonials Section */}
                    <section className="py-24 overflow-hidden">
                        <div className="container mx-auto px-6 text-center mb-12 scroll-animate slide-up">
                            <h2 className="text-4xl font-bold">But Don't Take Our Word For It</h2>
                            <p className="mt-4 text-lg text-gray-400">See what our clients have to say.</p>
                        </div>
                        <div className="scroll-animate scale-up delay-200">
                           <TestimonialScroller testimonials={testimonials} speed="normal" direction="left" />
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-4xl font-bold text-center mb-12 scroll-animate slide-up">Frequently Asked Questions (FAQ's)</h2>
                                <div className="bg-slate-800/50 border border-white/10 rounded-lg scroll-animate fade-in delay-200">
                                    {faqs.map((faq, index) => (
                                        <FAQItem key={index} question={faq.question} isOpen={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                            <p>{faq.answer}</p>
                                        </FAQItem>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default BrandingPage;