import nodemailer from 'nodemailer';
import logger from '../logger.js';
import ApiError from './ApiError.js';

const sendEmail = async (options: { email: string; subject: string; html: string; }) => {
    // 1. Check if email service is configured in .env file
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const errorMsg = "Email sending skipped as service is not configured.";
        logger.warn({ email: options.email, subject: options.subject }, errorMsg);
        // Throw a specific error that the frontend can display to the user.
        throw new ApiError(500, "The email service is currently unavailable. Please contact support.");
    }
    
    // 2. Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: (process.env.EMAIL_PORT || '465') === '465', // true for port 465, false for others
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 3. Define email options
    const mailOptions = {
        from: `"ApexNucleus" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 4. Send the email and handle potential errors
    try {
        await transporter.sendMail(mailOptions);
        logger.info({ to: options.email, from: process.env.EMAIL_USER, subject: options.subject }, "Email sent successfully.");
    } catch (error) {
        logger.error({ err: error }, "Failed to send email via Nodemailer.");
        // Throw a user-friendly error to be caught by the error handler middleware
        throw new ApiError(500, "There was an issue sending the email. Please check server configuration and try again.");
    }
};

const emailTemplate = (title: string, content: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0891b2; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">ApexNucleus</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="font-size: 20px; color: #0891b2;">${title}</h2>
      ${content}
    </div>
    <div style="background-color: #f7f7f7; color: #777; padding: 20px; text-align: center; font-size: 12px;">
      <p>If you did not request this, please ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} ApexNucleus. All rights reserved.</p>
    </div>
  </div>
`;

export const sendWelcomeEmail = (email: string, name: string) => {
    const subject = "Welcome to ApexNucleus!";
    const content = `
        <p>Hi ${name},</p>
        <p>Welcome to ApexNucleus! We're excited to have you on board. You can now log in to your dashboard to manage your services, get support, and much more.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || '#'}" style="background-color: #0891b2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Your Dashboard</a>
        </div>
        <p>Your login email is: <strong>${email}</strong></p>
        <p>Best Regards,<br/>The ApexNucleus Team</p>
    `;
    // Fire and forget, but log errors
    sendEmail({ email, subject, html: emailTemplate(subject, content) }).catch(err => {
        logger.error({ err, email, context: 'sendWelcomeEmail' }, "Failed to send welcome email asynchronously.");
    });
};

export const sendPasswordResetEmail = (email: string, resetUrl: string) => {
    const subject = "Reset Your ApexNucleus Password";
    const content = `
        <p>Hi there,</p>
        <p>You requested a password reset. Please click the button below to set a new password. This link is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0891b2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
    `;
    // This function must be awaited in the route to handle errors properly
    return sendEmail({ email, subject, html: emailTemplate('Password Reset Request', content) });
};

export const sendRegistrationOtpEmail = (email: string, otp: string) => {
    const subject = "Your ApexNucleus Verification Code";
    const content = `
        <p>Thank you for starting the registration process with ApexNucleus.</p>
        <p>Please use the following verification code to complete your sign up. This code is valid for 5 minutes.</p>
        <div style="background: #f2f2f2; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; text-align: center; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
        </div>
    `;
    // This function must be awaited in the route to handle errors properly
    return sendEmail({ email, subject, html: emailTemplate('Verify Your Email Address', content) });
};