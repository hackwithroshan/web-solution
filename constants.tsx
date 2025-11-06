import React from 'react';
import { Service, PricingPlan } from './types';
import { Server, Globe, Smartphone, ShieldCheck, Cloud, Palette, Megaphone, Cpu } from 'lucide-react';

export const MEGA_MENU_ITEMS = [
  {
    title: 'Design & Develop',
    icon: <Palette className="w-5 h-5 text-blue-400" />,
    links: [
      { name: 'Branding', path: '/services/branding' },
      { name: 'Websites', path: '/services/websites' },
      { name: 'Mobile Apps', path: '/services/mobile-apps' },
      { name: 'Software Development', path: '/services/software-development' },
      { name: 'App Store Optimization (ASO)', path: '/services/aso' },
    ],
  },
  {
    title: 'Digital Marketing',
    icon: <Megaphone className="w-5 h-5 text-purple-400" />,
    links: [
      { name: 'SEO', path: '/services/seo' },
      { name: 'Adwords / PPC', path: '/services/adwords-ppc' },
      { name: 'Social Media', path: '/services/social-media' },
      { name: 'Content Marketing', path: '/services/content-marketing' },
      { name: 'ORM', path: '/services/orm' },
    ],
  },
  {
    title: 'AI & Blockchain',
    icon: <Cpu className="w-5 h-5 text-pink-400" />,
    links: [
      { name: 'AI Integration', path: '/services/ai-integration' },
      { name: 'AI Automation', path: '/services/ai-automation' },
      { name: 'Blockchain Development', path: '/services/blockchain-development' },
    ],
  },
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { 
    name: 'Services', 
    path: '/services',
    megaMenu: MEGA_MENU_ITEMS,
    megaMenuTagline: {
        title: '🏆 Driven by Results',
        description: 'We deliver measurable outcomes that align with your business goals.',
        path: '/case-studies'
    }
  },
  { name: 'Case Studies', path: '/case-studies' },
  { name: 'Success Stories', path: '/success-stories' },
  { name: 'Blogs', path: '/blog' },
  { name: 'Contact Us', path: '/contact' },
];

export const SERVICES_DATA: Service[] = [
  {
    icon: <Cloud className="h-10 w-10 text-cyan-500" />,
    title: 'Cloud Hosting',
    description: 'Scalable and reliable cloud hosting solutions to keep your website fast and secure, 24/7.'
  },
  {
    icon: <Globe className="h-10 w-10 text-cyan-500" />,
    title: 'Domain Registration',
    description: 'Find and register the perfect domain name for your business with our easy-to-use search tools.'
  },
  {
    icon: <Server className="h-10 w-10 text-cyan-500" />,
    title: 'Website Development',
    description: 'Custom website development tailored to your brand, from simple landing pages to complex e-commerce platforms.'
  },
  {
    icon: <Smartphone className="h-10 w-10 text-cyan-500" />,
    title: 'App Development',
    description: 'Bring your ideas to life with our native and cross-platform mobile application development services.'
  },
   {
    icon: <ShieldCheck className="h-10 w-10 text-cyan-500" />,
    title: 'Managed Security',
    description: 'Comprehensive security packages to protect your digital assets from threats and vulnerabilities.'
  }
];

export const PRICING_DATA: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For small projects and personal sites.',
    features: ['1 Website', '10GB SSD Storage', '1TB Bandwidth', 'Free SSL Certificate', '24/7 Support'],
  },
  {
    name: 'Business',
    price: '$59',
    description: 'Ideal for growing businesses and professionals.',
    features: ['10 Websites', '50GB SSD Storage', '5TB Bandwidth', 'Free SSL Certificate', 'Priority Support'],
    isFeatured: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'Advanced solutions for large-scale applications.',
    features: ['Unlimited Websites', '200GB SSD Storage', 'Unmetered Bandwidth', 'Advanced Security', 'Dedicated Support Agent'],
  }
];