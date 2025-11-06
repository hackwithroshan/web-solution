import React from 'react';
import SeoMeta from '../components/SeoMeta';
import RippleGrid from '../components/RippleGrid';
import Breadcrumb from '../components/ui/Breadcrumb';

const SuccessStoriesPage: React.FC = () => {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Success Stories' },
    ];

    return (
        <>
            <SeoMeta
                title="Success Stories - ApexNucleus"
                description="Read our success stories."
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
                            <h1 className="text-4xl md:text-5xl font-extrabold">Success Stories</h1>
                            <p className="mt-4 text-lg text-gray-300">Coming Soon! We are working on this page.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuccessStoriesPage;
