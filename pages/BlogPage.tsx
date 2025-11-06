import React from 'react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';

const BlogPage: React.FC = () => {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Blog' },
    ];

    return (
        <>
            <SeoMeta
                title="Blog - ApexNucleus"
                description="Read the latest articles and updates from the ApexNucleus team."
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
                        <Breadcrumb crumbs={crumbs} className="mb-8" />
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold">Our Blog</h1>
                            <p className="mt-4 text-lg text-gray-300">Coming Soon! Stay tuned for articles and updates.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogPage;
