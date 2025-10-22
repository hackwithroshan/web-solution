import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import ApiError from '../utils/ApiError.js';
import logger from '../logger.js';

const router = express.Router();

// Helper function to format bytes into a readable string
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// @desc    Analyze a website's performance using Google PageSpeed Insights
// @route   POST /api/performance/analyze
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;
    const apiKey = process.env.PAGESPEED_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        logger.error("Neither PAGESPEED_API_KEY nor API_KEY are configured in environment variables.");
        return next(new ApiError(500, "The performance analyzer is not configured on the server. An API key is required."));
    }

    if (!url) {
        return next(new ApiError(400, 'Website URL is required.'));
    }

    try {
        const encodedUrl = encodeURIComponent(url);
        const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${apiKey}&strategy=mobile&category=PERFORMANCE`;
        
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            const errorData = await response.json();
            logger.error({ errorData }, `PageSpeed API error for URL: ${url}`);
            throw new ApiError(response.status, (errorData as any).error?.message || 'Failed to fetch performance data from Google.');
        }

        const data = await response.json() as any;
        const lighthouse = data.lighthouseResult;

        if (!lighthouse) {
            throw new ApiError(500, 'Could not retrieve performance report.');
        }
        
        const audits = lighthouse.audits;
        
        // Extract key metrics
        const performanceScore = Math.round((lighthouse.categories.performance.score || 0) * 100);
        const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
        const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
        const tti = audits['interactive']?.displayValue || 'N/A';
        const tbt = audits['total-blocking-time']?.displayValue || 'N/A';
        const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
        const speedIndex = audits['speed-index']?.displayValue || 'N/A';
        const pageSize = formatBytes(audits['total-byte-weight']?.numericValue || 0);
        const totalRequests = audits['network-requests']?.details?.items?.length || 'N/A';
        const ttfb = audits['server-response-time']?.displayValue || 'N/A';

        // Extract opportunities/diagnostics
        const opportunities = (lighthouse.categories.performance.auditRefs || [])
            .filter((ref: any) => ref.group === 'opportunities' && audits[ref.id]?.details?.overallSavingsMs > 0)
            .map((ref: any) => ({
                id: ref.id,
                title: audits[ref.id].title,
                description: audits[ref.id].description,
                savings: `${audits[ref.id].details.overallSavingsMs} ms`,
            }));

        const diagnostics = (lighthouse.categories.performance.auditRefs || [])
            .filter((ref: any) => ref.group === 'diagnostics' && audits[ref.id]?.score !== 1 && audits[ref.id]?.numericValue > 0)
            .map((ref: any) => ({
                id: ref.id,
                title: audits[ref.id].title,
                description: audits[ref.id].description,
                value: audits[ref.id].displayValue,
            }));


        const structuredResult = {
            analyzedUrl: data.id,
            performanceScore,
            metrics: {
                fcp, lcp, tti, tbt, cls, speedIndex, pageSize, totalRequests, ttfb
            },
            opportunities,
            diagnostics,
            fullReportUrl: `https://pagespeed.web.dev/report?url=${encodedUrl}`
        };

        res.json(structuredResult);

    } catch (error) {
        next(error);
    }
});

export default router;