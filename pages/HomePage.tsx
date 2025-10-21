import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Code, Bot, BarChart, Zap, Search, PenTool, Star, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroGraphic: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center [perspective:1200px]">
    <div className="relative w-full max-w-lg h-[300px] animate-float-3d [transform-style:preserve-3d]">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center [transform:rotateY(15deg)_rotateX(25deg)]">
           <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-800 to-blue-700 opacity-50 blur-2xl"></div>
           <Code className="absolute w-20 h-20 text-white/50" />
           <Bot className="absolute w-16 h-16 text-white/40 top-8 left-12 animate-pulse" style={{ animationDelay: '1s' }} />
           <BarChart className="absolute w-16 h-16 text-white/40 bottom-8 right-12 animate-pulse" style={{ animationDelay: '2s' }}/>
        </div>
    </div>
  </div>
);

const ServiceCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="bg-[#2A2A3A] p-8 rounded-xl border border-white/10 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-6">
            <Icon className="w-6 h-6 text-white"/>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string, name: string, title: string, company: string, avatar: string }> = ({ quote, name, title, company, avatar }) => (
    <div className="bg-[#2A2A3A] p-8 rounded-xl border border-white/10">
        <div className="flex items-center mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 ml-1" />
            <Star className="w-5 h-5 text-yellow-400 ml-1" />
            <Star className="w-5 h-5 text-yellow-400 ml-1" />
            <Star className="w-5 h-5 text-yellow-400 ml-1" />
        </div>
        <p className="text-gray-300 italic mb-6">"{quote}"</p>
        <div className="flex items-center">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover"/>
            <div className="ml-4">
                <p className="font-bold text-white">{name}</p>
                <p className="text-sm text-gray-400">{title}, {company}</p>
            </div>
        </div>
    </div>
);

const ProcessStep: React.FC<{ number: string, title: string, description: string }> = ({ number, title, description }) => (
    <div className="relative pl-12">
        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center font-bold text-white">
            {number}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    useScrollAnimation();

    const services = [
        { icon: Code, title: "Web Development", description: "Custom, scalable, and secure websites tailored to your business needs using the latest technologies." },
        { icon: Bot, title: "AI Development", description: "Integrate AI-powered tools and solutions to automate processes, gain insights, and enhance user experience." },
        { icon: Zap, title: "Hosting Solutions", description: "Reliable, high-performance hosting with 99.9% uptime to ensure your website is always fast and available." },
        { icon: Search, title: "SEO & Marketing", description: "Boost your online visibility and drive organic traffic with our data-driven SEO and marketing strategies." },
        { icon: PenTool, title: "UI/UX Design", description: "Crafting intuitive and engaging user interfaces that provide a seamless and memorable user journey." },
        { icon: BarChart, title: "Digital Strategy", description: "Comprehensive digital strategies to align your technology with your business goals for maximum impact." },
    ];

  return (
    <div className="text-white bg-[#1E1E2C] overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-b from-[#1E1E2C] to-[#3A0066]/30">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight scroll-animate slide-up">
              Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Digital Edge</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto md:mx-0 scroll-animate slide-up delay-100">
              We craft cutting-edge web experiences, AI-powered tools, and digital strategies to propel your business forward.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 scroll-animate slide-up delay-200 justify-center md:justify-start">
              <a href="#" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors transform hover:scale-105">
                Book a Call
              </a>
              <a href="#" className="bg-transparent border-2 border-blue-500 text-blue-400 font-bold px-8 py-3 rounded-md hover:bg-blue-500 hover:text-white transition-colors transform hover:scale-105">
                For WhatsApp Us
              </a>
            </div>
          </div>
          <div className="relative hidden md:block h-96 scroll-animate fade-in delay-300">
             <HeroGraphic />
          </div>
        </div>
      </section>

      {/* 2. Partners/Tech Logos Section */}
      <section className="py-12 bg-[#252535]">
        <div className="container mx-auto px-6">
            <h2 className="text-center text-gray-400 font-semibold uppercase tracking-widest scroll-animate fade-in">
                Technologies We Embrace
            </h2>
            <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-6 mt-8 text-gray-400 scroll-animate fade-in delay-100">
                <span className="font-bold text-xl">Hostinger</span>
                <span className="font-bold text-xl">Figma</span>
                <span className="font-bold text-xl">Docker</span>
                <span className="font-bold text-xl">WordPress</span>
                <span className="font-bold text-xl">Elementor</span>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <div key={service.title} className={`scroll-animate scale-up delay-${(index % 3) * 100 + 100}`}>
                        <ServiceCard {...service} />
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. Our Process Section */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold scroll-animate slide-up">Our Proven Process</h2>
                <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                    We follow a structured methodology to ensure your project's success from concept to launch.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
                 <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 hidden md:block">
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                 </div>
                 <div className="scroll-animate slide-up delay-200"><ProcessStep number="1" title="Discovery & Strategy" description="We start by understanding your vision, goals, and target audience to create a robust project roadmap." /></div>
                 <div className="scroll-animate slide-up delay-300"><ProcessStep number="2" title="Design & Development" description="Our team designs intuitive interfaces and writes clean code to build a high-performance, scalable product." /></div>
                 <div className="scroll-animate slide-up delay-400"><ProcessStep number="3" title="Launch & Optimize" description="We deploy your project and monitor its performance, providing ongoing support and optimization." /></div>
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
            <div className="grid lg:grid-cols-2 gap-8">
                 <div className="scroll-animate scale-up delay-200">
                    <TestimonialCard 
                        quote="Working with ApexNucleus was a game-changer. Their expertise in AI integration streamlined our entire workflow and boosted our productivity by 40%."
                        name="Jane Doe"
                        title="CEO"
                        company="Innovate Inc."
                        avatar="https://randomuser.me/api/portraits/women/44.jpg"
                    />
                 </div>
                 <div className="scroll-animate scale-up delay-300">
                    <TestimonialCard 
                        quote="The custom web platform they built for us is not only beautiful but incredibly fast and reliable. Their team was professional and delivered beyond our expectations."
                        name="John Smith"
                        title="Founder"
                        company="Solutions Co."
                        avatar="https://randomuser.me/api/portraits/men/32.jpg"
                    />
                 </div>
            </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#6A0DAD] to-[#007BFF]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold scroll-animate slide-up">
                Transform Your Ideas Into Reality!
            </h2>
            <p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                Bringing ideas into reality. Let’s make your idea from concept to a successful digital product.
            </p>
            <div className="mt-8 flex justify-center gap-4 scroll-animate slide-up delay-200">
                <a href="#" className="bg-white text-purple-700 font-bold px-8 py-3 rounded-md hover:bg-gray-200 transition-colors transform hover:scale-105">
                    Share Your Vision
                </a>
                 <a href="#" className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-md hover:bg-white hover:text-purple-700 transition-colors transform hover:scale-105">
                    Schedule Consultation
                </a>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;