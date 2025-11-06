import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import SeoMeta from '../../components/SeoMeta';
import RippleGrid from '../../components/RippleGrid';
import TestimonialScroller from '../../components/TestimonialScroller';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
    ArrowRight, Star, Code, Monitor, Smartphone, Rocket, Users, CheckCircle,
    Server, ShoppingCart, ShieldCheck, PenTool, Search, Layout, ChevronDown, ChevronUp
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


const WebsitesPage: React.FC = () => {
    useScrollAnimation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const crumbs = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: 'Websites' }];
    
    const testimonials = [
        { 
            quote: "The custom web platform ApexNucleus built for us is not only beautiful but incredibly fast and reliable. Their team was professional and delivered beyond our expectations.",
            name: "John Smith",
            title: "Founder",
            company: "Solutions Co.",
            avatar: "https://randomuser.me/api/portraits/men/33.jpg"
        },
        { 
            quote: "Our new e-commerce site has seen a 200% increase in conversions since launch. The user experience is seamless, and the admin panel is a dream to work with. Highly recommended!",
            name: "Jessica Rodriguez",
            title: "Founder",
            company: "Artisan Goods",
            avatar: "https://randomuser.me/api/portraits/women/45.jpg"
        },
        { 
            quote: "From concept to launch, the web development process was transparent and collaborative. They listened to our needs and delivered a product that exceeded our vision.",
            name: "David Chen",
            title: "IT Manager",
            company: "SecureData",
            avatar: "https://randomuser.me/api/portraits/men/47.jpg"
        },
    ];

    const faqs = [
        { question: "How long does it take to build a website?", answer: "A typical marketing website can take 4-8 weeks from start to finish. More complex projects like e-commerce platforms or web applications can take 3-6 months or longer. We provide a detailed project timeline after the discovery phase." },
        { question: "Will my website be mobile-friendly?", answer: "Absolutely. All websites we build are fully responsive, meaning they adapt perfectly to all screen sizes, from desktops to smartphones. We take a mobile-first approach to design and development." },
        { question: "Do you provide website hosting and maintenance?", answer: "Yes, we offer comprehensive hosting and maintenance packages to ensure your website remains fast, secure, and up-to-date. This includes regular backups, security scans, and software updates." },
        { question: "Can you integrate my website with other tools?", answer: "Yes. We specialize in integrating websites with a wide range of third-party services, including CRMs, payment gateways, marketing automation platforms, and more to streamline your business operations." },
    ];


    return (
        <>
            <SeoMeta title="Website Design & Development - ApexNucleus" description="Crafting high-performance, visually stunning websites that convert. ApexNucleus offers custom web development, e-commerce solutions, and responsive design." />
            <div className="relative text-white bg-slate-900 overflow-x-hidden">
                <div className="fixed inset-0 z-0 opacity-50"><RippleGrid gridColor="#475569" /></div>
                
                <div className="relative z-10">
                    {/* Hero Section */}
                    <section className="pt-40 pb-20">
                        <div className="container mx-auto px-6">
                            <Breadcrumb crumbs={crumbs} className="mb-8 scroll-animate fade-in" />
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="scroll-animate slide-up">
                                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">Websites</h1>
                                    <h2 className="text-2xl mt-4 text-cyan-400">Crafting Digital Experiences That Convert</h2>
                                    <p className="mt-6 text-lg text-gray-300">Your website is your digital storefront. At ApexNucleus, we build high-performance, visually stunning websites that not only capture your brand's essence but also drive business growth. From sleek marketing sites to robust e-commerce platforms, we deliver digital solutions that engage users and deliver results.</p>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
                                        <Link to="/case-studies" className="text-white font-semibold flex items-center gap-2 hover:text-cyan-400 transition-colors"><ArrowRight className="w-5 h-5 bg-cyan-500 rounded-full p-1" /> View Our Portfolio</Link>
                                        <Link to="/success-stories" className="text-white font-semibold flex items-center gap-2 hover:text-cyan-400 transition-colors"><ArrowRight className="w-5 h-5 bg-cyan-500 rounded-full p-1" /> Client Success Stories</Link>
                                    </div>
                                    <Button as={Link} to="/contact" className="mt-8">Start Your Project</Button>
                                </div>
                                <div className="hidden md:flex justify-center items-center scroll-animate scale-up delay-200">
                                     <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-br from-cyan-900 via-slate-900 to-purple-900 p-4">
                                        <div className="w-full h-full rounded-full border-2 border-dashed border-white/20 animate-spin-slow flex items-center justify-center">
                                            <Code className="w-24 h-24 text-cyan-400 opacity-80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Types of Websites Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-12 scroll-animate slide-up">
                                <h2 className="text-4xl font-bold">Web Solutions We Build</h2>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { icon: Monitor, title: "Corporate & Marketing Websites" },
                                    { icon: ShoppingCart, title: "E-Commerce Stores" },
                                    { icon: Layout, title: "Landing Pages & Microsites" },
                                    { icon: Users, title: "Web Portals & Applications" }
                                ].map((item, index) => (
                                    <div key={item.title} className={`bg-slate-800/50 border border-white/10 p-6 rounded-lg text-center scroll-animate scale-up delay-${index*100}`}>
                                        <item.icon className="w-12 h-12 text-cyan-400 mb-4 mx-auto" />
                                        <h3 className="text-xl font-bold">{item.title}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Our Process Section */}
                    <section className="py-20">
                         <div className="container mx-auto px-6">
                            <div className="text-center mb-12 scroll-animate slide-up">
                                <h2 className="text-4xl font-bold">Our Development Process</h2>
                                <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">A transparent and collaborative journey from idea to launch.</p>
                            </div>
                             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { icon: Search, title: "1. Discovery & Strategy", desc: "Understanding your goals, audience, and market to create a solid project plan." },
                                    { icon: PenTool, title: "2. UI/UX Design", desc: "Crafting intuitive and engaging user interfaces that look stunning and are easy to use." },
                                    { icon: Code, title: "3. Development", desc: "Writing clean, efficient, and scalable code using modern technologies." },
                                    { icon: Rocket, title: "4. Launch & Support", desc: "Deploying your site and providing ongoing maintenance to ensure optimal performance." }
                                ].map((item, index) => (
                                    <div key={item.title} className={`bg-slate-800/50 border border-white/10 p-6 rounded-lg scroll-animate scale-up delay-${index*100}`}>
                                        <div className="p-3 bg-slate-700 rounded-full inline-block mb-4"><item.icon className="w-6 h-6 text-cyan-400" /></div>
                                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* Features Section */}
                     <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="scroll-animate slide-up">
                                    <h2 className="text-3xl font-bold">Features of Every Website We Build</h2>
                                    <p className="mt-4 text-gray-300">We don't just build websites; we build digital assets. Every project we undertake comes with a set of core features designed for success in the modern web.</p>
                                     <ul className="mt-6 space-y-4">
                                        {[
                                            { icon: Smartphone, title: "Responsive Design", desc: "Perfect viewing experience on any device, from mobile to desktop." },
                                            { icon: Rocket, title: "High Performance", desc: "Optimized for speed to improve user experience and SEO rankings." },
                                            { icon: Search, title: "SEO-Ready", desc: "Built with search engine best practices to help you get found online." },
                                            { icon: ShieldCheck, title: "Secure & Reliable", desc: "Implementing modern security standards to protect your site and your users." }
                                        ].map(item => (
                                            <li key={item.title} className="flex items-start gap-4">
                                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="font-semibold">{item.title}</h3>
                                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="hidden lg:block scroll-animate fade-in delay-200">
                                    <img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop" alt="Website on multiple devices" className="rounded-lg shadow-2xl" />
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Testimonials Section */}
                    <section className="py-24 overflow-hidden">
                        <div className="container mx-auto px-6 text-center mb-12 scroll-animate slide-up">
                            <h2 className="text-4xl font-bold">Trusted by Businesses Worldwide</h2>
                        </div>
                        <div className="scroll-animate scale-up delay-200">
                           <TestimonialScroller testimonials={testimonials} speed="normal" direction="left" />
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-4xl font-bold text-center mb-12 scroll-animate slide-up">Frequently Asked Questions</h2>
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

export default WebsitesPage;
