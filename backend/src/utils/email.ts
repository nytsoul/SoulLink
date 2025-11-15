import nodemailer from 'nodemailer';

// Initialize email transporter only if SMTP is configured
const getEmailTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (!smtpHost || !smtpUser || !smtpPass || 
      smtpHost.trim() === '' || smtpUser.trim() === '' || smtpPass.trim() === '') {
    return null;
  }
  
  try {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } catch (error) {
    console.warn('Email transporter initialization failed:', error);
    return null;
  }
};

const transporter = getEmailTransporter();

export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  // If email is not configured, log the verification link instead (for development)
  if (!transporter || !process.env.EMAIL_FROM) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    console.log(`[Email - SMTP not configured] Verification email for: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('To enable email, configure SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM in .env');
    // Still return true so registration can proceed
    return true;
  }

  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your Loves account',
      html: `
        <h2>Welcome to Loves!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Log verification link for development
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    console.log(`[Email - Failed to send] Verification URL: ${verificationUrl}`);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  // If email is not configured, log the reset link instead (for development)
  if (!transporter || !process.env.EMAIL_FROM) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[Email - SMTP not configured] Password reset email for: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('To enable email, configure SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM in .env');
    // Still return true so password reset can proceed
    return true;
  }

  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset your Loves password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Log reset link for development
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[Email - Failed to send] Reset URL: ${resetUrl}`);
    return false;
  }
};

