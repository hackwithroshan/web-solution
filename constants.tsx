import React from 'react';
import { Service, PricingPlan } from './types';
import { Server, Globe, Smartphone, ShieldCheck, Cloud } from 'lucide-react';

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Website Analyzer', path: '/website-analyzer' },
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