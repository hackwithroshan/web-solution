import React from 'react';
import Skeleton from './ui/Skeleton';

const HomePageSkeleton: React.FC = () => {
    return (
        <div className="relative text-white bg-[#1E1E2C] overflow-x-hidden">
            <div className="relative z-10">
                {/* Hero Section Skeleton */}
                <section className="pt-40 pb-20 min-h-[70vh] flex items-center justify-center text-center">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
                            <Skeleton className="h-6 w-full rounded" />
                            <Skeleton className="h-6 w-5/6 mx-auto rounded" />
                            <div className="flex justify-center gap-4 pt-4">
                                <Skeleton className="h-12 w-48 rounded-full" />
                                <Skeleton className="h-12 w-48 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logo Loop Skeleton */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <Skeleton className="h-6 w-1/3 mx-auto mb-8 rounded" />
                        <div className="flex justify-between items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-24 rounded-md" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services Section Skeleton */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <Skeleton className="h-10 w-1/4 mx-auto mb-4 rounded" />
                            <Skeleton className="h-6 w-1/2 mx-auto rounded" />
                        </div>
                        <Skeleton className="h-[500px] w-full max-w-5xl mx-auto rounded-2xl" />
                    </div>
                </section>

                {/* Process Section Skeleton */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                           <Skeleton className="h-10 w-1/4 mx-auto mb-4 rounded" />
                            <Skeleton className="h-6 w-1/2 mx-auto rounded" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </section>

                 {/* Testimonials Section Skeleton */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <Skeleton className="h-10 w-1/4 mx-auto mb-4 rounded" />
                            <Skeleton className="h-6 w-1/2 mx-auto rounded" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                    </div>
                </section>

                 {/* CTA Section Skeleton */}
                <section className="py-24">
                    <div className="container mx-auto px-6 text-center">
                        <Skeleton className="h-12 w-1/2 mx-auto mb-4 rounded" />
                        <Skeleton className="h-6 w-2/3 mx-auto rounded" />
                        <div className="flex justify-center gap-4 pt-8">
                            <Skeleton className="h-12 w-48 rounded-full" />
                            <Skeleton className="h-12 w-48 rounded-full" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePageSkeleton;
