import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Phone, MapPin, Send, User as UserIcon, Loader } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { submitContactForm } from '../services/api';

const ContactInfoItem: React.FC<{ icon: React.ReactNode, title: string, content: string, href?: string }> = ({ icon, title, content, href }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
            {icon}
        </div>
        <div className="ml-4">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {href ? (
                <a href={href} className="text-gray-300 hover:text-cyan-400 transition-colors">{content}</a>
            ) : (
                <p className="text-gray-300">{content}</p>
            )}
        </div>
    </div>
);


const ContactUsPage: React.FC = () => {
    useScrollAnimation();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await submitContactForm(formData);
            addToast(result.message, 'success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch (error: any) {
            addToast(error.message || 'Failed to send message.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SeoMeta
                title="Contact Us - ApexNucleus"
                description="Get in touch with the ApexNucleus team. We're here to help you with your web and cloud solution needs."
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
                        <div className="text-center mb-16">
                            <h1 className="text-5xl font-extrabold scroll-animate slide-up">Get in Touch</h1>
                            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto scroll-animate slide-up delay-100">
                                We're here to help. Whether you have a question about our services or want to start a project, feel free to reach out.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            <div className="space-y-8 scroll-animate slide-up delay-200">
                                <ContactInfoItem
                                    icon={<Mail size={24} />}
                                    title="Email Us"
                                    content="support@apexnucleus.com"
                                    href="mailto:support@apexnucleus.com"
                                />
                                <ContactInfoItem
                                    icon={<Phone size={24} />}
                                    title="Call Us"
                                    content="+1 (555) 123-4567"
                                    href="tel:+15551234567"
                                />
                                <ContactInfoItem
                                    icon={<MapPin size={24} />}
                                    title="Our Office"
                                    content="123 Innovation Drive, Tech City, 10001"
                                />
                            </div>

                            <div className="bg-[#2A2A3A] p-8 rounded-xl border border-white/10 scroll-animate slide-up delay-300">
                                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <Input icon={<UserIcon className="w-5 h-5 text-gray-400" />} placeholder="Your Name" name="name" value={formData.name} onChange={handleChange} required />
                                    <Input icon={<Mail className="w-5 h-5 text-gray-400" />} type="email" placeholder="Your Email" name="email" value={formData.email} onChange={handleChange} required />
                                    <Input placeholder="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
                                    <textarea
                                        className="w-full border shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 py-3 bg-[#3A3A4A] text-gray-200 border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-4"
                                        placeholder="Your Message"
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    <Button type="submit" className="w-full flex items-center justify-center" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader className="animate-spin h-5 w-5 mr-2"/> : <Send size={18} className="mr-2" />}
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactUsPage;