import express, { Request, Response } from 'express';
const router = express.Router();

// @desc    Fetch public keys
// @route   GET /api/config/keys
// @access  Public
router.get('/keys', (req: Request, res: Response) => {
    try {
        res.json({
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        res.status(500).json({ message: 'Configuration error' });
    }
});

export default router;
