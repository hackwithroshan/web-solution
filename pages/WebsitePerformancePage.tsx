import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { analyzeWebsitePerformance } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Search, Loader, Zap, AlertTriangle, ChevronsRight, Timer, Smartphone, HardDrive, BarChart, ExternalLink } from 'lucide-react';

// --- Helper Functions & Components ---

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
};

const getStatus = (score: number): { text: string; color: string } => {
    if (score >= 90) return { text: 'Good', color: 'bg-green-100 text-green-800' };
    if (score >= 50) return { text: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const color = getScoreColor(score);
    const status = getStatus(score);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${color}`}>{score}</span>
            </div>
            <span className={`mt-4 text-sm font-semibold px-3 py-1 rounded-full ${status.color}`}>{status.text}</span>
        </div>
    );
};

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-slate-50 p-4 rounded-xl flex items-center">
        <Icon className="w-8 h-8 text-gray-400 mr-4" />
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ResultDisplay: React.FC<{ results: any }> = ({ results }) => {
    useScrollAnimation();
    
    return (
        <div className="space-y-12">
            <div className="text-center">
                <p className="text-gray-600">Performance report for:</p>
                <a href={results.analyzedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold break-all">{results.analyzedUrl}</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 scroll-animate scale-up">
                    <ScoreGauge score={results.performanceScore} />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="scroll-animate slide-up delay-100"><MetricCard title="Largest Contentful Paint" value={results.metrics.lcp} icon={Timer}/></div>
                    <div className="scroll-animate slide-up delay-200"><MetricCard title="Total Blocking Time" value={results.metrics.tbt} icon={Timer}/></div>
                    <div className="scroll-animate slide-up delay-300"><MetricCard title="Cumulative Layout Shift" value={results.metrics.cls} icon={BarChart}/></div>
                    <div className="scroll-animate slide-up delay-400"><MetricCard title="Page Size" value={results.metrics.pageSize} icon={HardDrive}/></div>
                    <div className="scroll-animate slide-up delay-500"><MetricCard title="Total Requests" value={results.metrics.totalRequests} icon={ChevronsRight}/></div>
                    <div className="scroll-animate slide-up delay-500"><MetricCard title="Time to First Byte" value={results.metrics.ttfb} icon={Timer}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm scroll-animate slide-up">
                    <h3 className="text-xl font-bold mb-4">Opportunities</h3>
                     <p className="text-sm text-gray-500 mb-4">These suggestions can help your page load faster. They don't directly affect the Performance score.</p>
                    <div className="space-y-3">
                        {results.opportunities.map((item: any) => (
                            <div key={item.id} className="p-3 bg-green-50 rounded-lg">
                                <p className="font-semibold text-green-800">{item.title}</p>
                                <p className="text-sm text-green-700">Potential savings: <strong>{item.savings}</strong></p>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm scroll-animate slide-up delay-100">
                    <h3 className="text-xl font-bold mb-4">Diagnostics</h3>
                    <p className="text-sm text-gray-500 mb-4">More information about the performance of your application.</p>
                    <div className="space-y-3">
                        {results.diagnostics.map((item: any) => (
                            <div key={item.id} className="p-3 bg-yellow-50 rounded-lg">
                                <p className="font-semibold text-yellow-800">{item.title}</p>
                                <p className="text-sm text-yellow-700">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="text-center mt-8">
                 <a href={results.fullReportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                     View Full Report on PageSpeed Insights <ExternalLink size={18} />
                 </a>
            </div>
        </div>
    );
};


const WebsitePerformancePage: React.FC = () => {
    useScrollAnimation();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);
        
        // Basic URL validation
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `https://${formattedUrl}`;
        }

        try {
            new URL(formattedUrl);
        } catch (_) {
            addToast('Please enter a valid URL.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const data = await analyzeWebsitePerformance(formattedUrl);
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-50 text-gray-800">
            {/* Hero Section */}
            <section className="bg-white pt-20 pb-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Zap className="w-16 h-16 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold scroll-animate slide-up">Website Speed Test</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto scroll-animate slide-up delay-100">
                        Enter a URL to analyze your page speed and see how to improve performance with real-world data.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 scroll-animate scale-up delay-200">
                        <div className="relative flex-grow">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                             <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter a web page URL (e.g., example.com)"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                required
                                disabled={isLoading}
                             />
                        </div>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center">
                           {isLoading ? <Loader className="animate-spin h-6 w-6" /> : 'Analyze'}
                        </button>
                    </form>
                </div>
            </section>
            
            {/* Results Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    {isLoading && (
                        <div className="text-center">
                            <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
                            <h2 className="text-2xl font-bold">Analyzing your website...</h2>
                            <p className="text-gray-500">This may take a moment. We're running a full audit.</p>
                        </div>
                    )}
                    {error && (
                        <div className="max-w-2xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-red-800">Analysis Failed</h2>
                            <p className="text-red-700 mt-2">{error}</p>
                        </div>
                    )}
                    {results && <ResultDisplay results={results} />}
                </div>
            </section>
        </div>
    );
};

export default WebsitePerformancePage;