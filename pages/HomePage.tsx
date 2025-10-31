import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import MagicBento from '../components/MagicBento';
import { LogoLoop } from '../components/LogoLoop';
import SeoMeta from '../components/SeoMeta';
import TestimonialScroller from '../components/TestimonialScroller';
import ProcessCard from '../components/ProcessCard';
import ParticleCanvas from '../components/ParticleCanvas';
// FIX: Import 'RippleGrid' component to resolve 'Cannot find name' error.
import RippleGrid from '../components/RippleGrid';
import { Link } from 'react-router-dom';
import ConsultationModal from '../components/ConsultationModal';

const HomePage: React.FC = () => {
    useScrollAnimation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const techLogos = [
        { node: <span className="font-bold text-xl text-gray-400">Hostinger</span>, title: "Hostinger" },
        { node: <span className="font-bold text-xl text-gray-400">Figma</span>, title: "Figma" },
        { node: <span className="font-bold text-xl text-gray-400">Docker</span>, title: "Docker" },
        { node: <span className="font-bold text-xl text-gray-400">WordPress</span>, title: "WordPress" },
        { node: <span className="font-bold text-xl text-gray-400">Elementor</span>, title: "Elementor" },
    ];
    
    const testimonials1 = [
        { 
            quote: "Working with ApexNucleus was a game-changer. Their expertise in AI integration streamlined our entire workflow and boosted our productivity by 40%.",
            name: "Jane Doe",
            title: "CEO",
            company: "Innovate Inc.",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/woman-testimonial.jpg"
        },
        { 
            quote: "The custom web platform they built for us is not only beautiful but incredibly fast and reliable. Their team was professional and delivered beyond our expectations.",
            name: "John Smith",
            title: "Founder",
            company: "Solutions Co.",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/man-testimonial.jpg"
        },
        { 
            quote: "Their cloud hosting is top-notch. We've had 99.99% uptime since migrating, and their support team is always responsive and helpful. Highly recommended!",
            name: "Emily White",
            title: "CTO",
            company: "TechForward",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/woman-testimonial-2.jpg"
        },
        { 
            quote: "ApexNucleus handled our domain registration and setup flawlessly. The process was smooth, and they provided excellent guidance on choosing the right TLD for our brand.",
            name: "Michael Brown",
            title: "Marketing Director",
            company: "BrandMakers",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/man-testimonial-2.jpg"
        },
    ];

    const testimonials2 = [
        { 
            quote: "The mobile app they developed has received rave reviews from our users. The UI/UX is intuitive and the performance is stellar. A truly professional team.",
            name: "Sarah Lee",
            title: "Product Manager",
            company: "Appify",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/woman-testimonial-3.jpg"
        },
        { 
            quote: "We were struggling with security vulnerabilities. ApexNucleus's managed security service has given us peace of mind. Their proactive approach is commendable.",
            name: "David Chen",
            title: "IT Manager",
            company: "SecureData",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/man-testimonial-3.jpg"
        },
        { 
            quote: "From concept to launch, the web development process was transparent and collaborative. They listened to our needs and delivered a product that exceeded our vision.",
            name: "Jessica Rodriguez",
            title: "Founder",
            company: "Artisan Goods",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/woman-testimonial-4.jpg"
        },
        { 
            quote: "The AI chatbot they implemented on our site has reduced support tickets by 30% and improved customer satisfaction. An incredible return on investment.",
            name: "Kevin Martinez",
            title: "Support Lead",
            company: "HelpDesk Heroes",
            avatar: "https://res.cloudinary.com/dvrqft9ov/image/upload/f_auto,q_auto,w_96,h_96,c_fill,g_face/v1719482483/demo/man-testimonial-4.jpg"
        }
    ];

  return (
    <>
    <SeoMeta
        title="ApexNucleus: Web & Cloud Solutions | AI-Powered Digital Transformation"
        description="We craft cutting-edge web experiences, AI-powered tools, and digital strategies to propel your business forward. Explore our services for hosting, development, and more."
    />
    <div className="relative text-white bg-[#1E1E2C] overflow-x-hidden">
       {/* Global background element */}
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

      {/* Wrapper for all content to be above the background */}
      <div className="relative z-10">
          {/* 1. Hero Section */}
          <section className="pt-40 pb-20 min-h-[70vh] flex items-center justify-center text-center">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                 <h1 className="text-5xl md:text-6xl font-extrabold leading-tight scroll-animate slide-up">
                  Innovating the Digital Future — <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Smarter, Faster, and Limitless</span>
                </h1>
                <p className="mt-6 text-lg text-gray-300 mx-auto scroll-animate slide-up delay-100">
                  ApexNucleus delivers intelligent digital solutions across Hosting, Domains, AI Systems, Website Development, Mobile Apps, and Ads Management — empowering businesses across the UK and beyond to grow fearlessly in the digital era.
                </p>
                 <p className="mt-4 text-md text-gray-400 mx-auto scroll-animate slide-up delay-200 max-w-3xl">
                    Welcome to <strong>ApexNucleus</strong>, where creativity meets technology and innovation fuels transformation.
                    We help brands, businesses, and creators build their digital foundations — from fast, secure hosting to AI-driven automation and world-class web development.
                    Our mission is simple — to make technology effortless, efficient, and extraordinarily powerful for every business.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 scroll-animate slide-up delay-300 justify-center">
                  <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-3 rounded-full transition-all duration-500 ease-in-out transform hover:scale-105 shadow-lg bg-[length:200%_auto] hover:bg-[right_center]">
                    Get Started Today
                  </Link>
                  <button onClick={() => setIsModalOpen(true)} className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-gray-800 transition-colors transform hover:scale-105 shadow-lg">
                    Book a Free Consultation
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Partners/Tech Logos Section */}
          <section className="py-12">
            <div className="container mx-auto px-6">
                <h2 className="text-center text-gray-400 font-semibold uppercase tracking-widest scroll-animate fade-in">
                    Technologies We Embrace
                </h2>
                <div className="mt-8 scroll-animate fade-in delay-100">
                    <LogoLoop
                        logos={techLogos}
                        speed={80}
                        direction="left"
                        logoHeight={24}
                        gap={60}
                        pauseOnHover
                        fadeOut
                        fadeOutColor="#1E1E2C"
                        ariaLabel="Technologies we embrace"
                    />
                </div>
            </div>
          </section>
          
          {/* 3. Our Services Section */}
          <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold scroll-animate slide-up">Our Services</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                        We offer comprehensive digital solutions to elevate your business in the modern era.
                    </p>
                </div>
                <div className="flex justify-center scroll-animate fade-in delay-200">
                    <MagicBento 
                        textAutoHide={true}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        enableTilt={true}
                        enableMagnetism={true}
                        clickEffect={true}
                        spotlightRadius={300}
                        particleCount={12}
                        glowColor="132, 0, 255"
                    />
                </div>
            </div>
          </section>

          {/* 4. Our Process Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <ParticleCanvas />
            </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold scroll-animate slide-up">Our Proven Process</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                        We follow a structured methodology to ensure your project's success from concept to launch.
                    </p>
                </div>
                <div className="relative">
                    {/* Dashed line connecting cards on desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2" aria-hidden="true">
                        <svg width="100%" height="100%">
                            <line x1="15%" y1="50%" x2="85%" y2="50%" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeDasharray="10 10" />
                        </svg>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-x-12 gap-y-16 relative">
                         <div className="scroll-animate slide-up delay-200">
                            <ProcessCard 
                                number="1" 
                                title="Discovery & Strategy" 
                                description="We start by understanding your vision, goals, and target audience to create a robust project roadmap." 
                            />
                        </div>
                         <div className="scroll-animate slide-up delay-300">
                            <ProcessCard 
                                number="2" 
                                title="Design & Development" 
                                description="Our team designs intuitive interfaces and writes clean code to build a high-performance, scalable product." 
                            />
                        </div>
                         <div className="scroll-animate slide-up delay-400">
                            <ProcessCard 
                                number="3" 
                                title="Launch & Optimize" 
                                description="We deploy your project and monitor its performance, providing ongoing support and optimization." 
                            />
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* 5. Testimonials Section */}
          <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold scroll-animate slide-up">What Our Clients Say</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                        Hear from businesses that have experienced the ApexNucleus difference.
                    </p>
                </div>
                <div className="bg-black/10 backdrop-blur-sm border border-white/10 py-6 rounded-2xl overflow-hidden scroll-animate scale-up delay-200">
                    <TestimonialScroller testimonials={testimonials1} direction="left" speed="normal" />
                    <TestimonialScroller testimonials={testimonials2} direction="right" speed="normal" />
                </div>
            </div>
          </section>

          {/* 6. Final CTA Section */}
          <section className="py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold scroll-animate slide-up">
                    Transform Your Ideas Into Reality!
                </h2>
                <p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                    Bringing ideas into reality. Let’s make your idea from concept to a successful digital product.
                </p>
                <div className="mt-8 flex justify-center gap-4 scroll-animate slide-up delay-200">
                    <button onClick={() => setIsModalOpen(true)} className="bg-white text-purple-700 font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors transform hover:scale-105 shadow-lg">
                        Share Your Vision
                    </button>
                     <button onClick={() => setIsModalOpen(true)} className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-purple-700 transition-colors transform hover:scale-105">
                        Schedule Consultation
                    </button>
                </div>
            </div>
          </section>
      </div>
      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
    </>
  );
};

export default HomePage;