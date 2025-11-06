import React from 'react';
import { Link } from 'react-router-dom';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Lightbulb, ShieldCheck, Users, Award } from 'lucide-react';

const ValueCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-[#2A2A3A] p-6 rounded-xl border border-white/10 text-center h-full">
        <div className="inline-block p-4 bg-cyan-900/50 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </div>
);

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
                description="Learn about the mission, vision, and team behind ApexNucleus, a leading provider of web and cloud solutions."
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
                    {/* Hero Section */}
                    <section className="pt-40 pb-20">
                        <div className="container mx-auto px-6">
                            <Breadcrumb crumbs={crumbs} className="mb-8 scroll-animate fade-in" />
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="scroll-animate slide-up">
                                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">We are ApexNucleus</h1>
                                    <p className="mt-6 text-lg text-gray-300">Your trusted partner in digital innovation. We craft bespoke web and cloud solutions that empower businesses to scale, innovate, and lead in their industries.</p>
                                    <Button as={Link} to="/contact" className="mt-8">Let's Talk</Button>
                                </div>
                                <div className="hidden md:block scroll-animate fade-in delay-200">
                                    <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1200&auto=format&fit=crop" alt="Abstract technology background" className="rounded-lg shadow-2xl" loading="lazy" decoding="async"/>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Mission Section */}
                    <section className="py-20 bg-black/20">
                        <div className="container mx-auto px-6 text-center max-w-4xl">
                            <h2 className="text-4xl font-bold mb-4 scroll-animate slide-up">Our Mission</h2>
                            <p className="text-xl text-gray-300 scroll-animate slide-up delay-100">
                                To empower businesses of all sizes to thrive in the digital landscape by providing innovative, reliable, and scalable web and cloud solutions. We are committed to turning complex challenges into simple, elegant realities.
                            </p>
                        </div>
                    </section>

                    {/* Founder Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6">
                            <div className="grid md:grid-cols-5 gap-12 items-center">
                                <div className="md:col-span-2 scroll-animate scale-up">
                                    <img 
                                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" 
                                        alt="Roshan Kumar Pandey, Founder of ApexNucleus" 
                                        className="rounded-lg shadow-2xl w-full"
                                        loading="lazy" decoding="async"
                                    />
                                </div>
                                <div className="md:col-span-3 scroll-animate slide-up delay-200">
                                    <h3 className="text-lg font-semibold text-cyan-400">Meet The Founder</h3>
                                    <h2 className="text-4xl font-bold mt-2">Roshan Kumar Pandey</h2>
                                    <p className="mt-6 text-lg text-gray-300">
                                        Roshan Kumar Pandey is the visionary behind ApexNucleus. With a profound passion for technology and a relentless drive for innovation, he founded the company with a single mission: to provide businesses with the digital tools they need to succeed. Roshan believes in building strong partnerships with clients, ensuring that every solution is not just technically sound, but also perfectly aligned with their strategic goals.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Values Section */}
                    <section className="py-20 bg-black/20">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-12 scroll-animate slide-up">
                                <h2 className="text-4xl font-bold">Our Core Values</h2>
                                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">The principles that guide our work and our relationships.</p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="scroll-animate scale-up delay-100">
                                    <ValueCard icon={<Lightbulb className="w-8 h-8 text-cyan-400" />} title="Innovation" description="We constantly explore new technologies and ideas to deliver cutting-edge solutions." />
                                </div>
                                <div className="scroll-animate scale-up delay-200">
                                    <ValueCard icon={<ShieldCheck className="w-8 h-8 text-cyan-400" />} title="Integrity" description="We operate with transparency and honesty, building trust through every interaction." />
                                </div>
                                <div className="scroll-animate scale-up delay-300">
                                    <ValueCard icon={<Users className="w-8 h-8 text-cyan-400" />} title="Partnership" description="We succeed when our clients succeed. We work as an extension of your team." />
                                </div>
                                <div className="scroll-animate scale-up delay-400">
                                    <ValueCard icon={<Award className="w-8 h-8 text-cyan-400" />} title="Excellence" description="We are committed to the highest standards of quality in everything we do." />
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* CTA Section */}
                    <section className="py-20">
                        <div className="container mx-auto px-6 text-center">
                            <h2 className="text-3xl md:text-4xl font-extrabold scroll-animate slide-up">Ready to Build Your Future?</h2>
                            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto scroll-animate slide-up delay-100">
                                Let's collaborate to create something extraordinary.
                            </p>
                            <Button as={Link} to="/contact" className="mt-8 scroll-animate scale-up delay-200">Start a Project</Button>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default AboutPage;