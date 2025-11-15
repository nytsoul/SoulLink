import twilio from 'twilio';

// Initialize Twilio client only if credentials are provided
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken || accountSid.trim() === '' || authToken.trim() === '') {
    return null;
  }
  
  try {
    return twilio(accountSid, authToken);
  } catch (error) {
    console.warn('Twilio initialization failed:', error);
    return null;
  }
};

const client = getTwilioClient();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMSOTP = async (phone: string, otp: string): Promise<boolean> => {
  // If Twilio is not configured, log the OTP instead (for development)
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[SMS OTP - Twilio not configured] Phone: ${phone}, OTP: ${otp}`);
    console.log('To enable SMS, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
    // Still return true so registration can proceed (OTP is stored and can be verified)
    return true;
  }

  try {
    await client.messages.create({
      body: `Your Loves verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    // Log OTP for development purposes
    console.log(`[SMS OTP - Failed to send] Phone: ${phone}, OTP: ${otp}`);
    return false;
  }
};

// Store OTPs in memory (use Redis in production)
// Make it globally accessible for the auth routes
(global as any).otpStore = (global as any).otpStore || new Map<string, { otp: string; expiresAt: number }>();

const otpStore = (global as any).otpStore;

export const storeOTP = (key: string, otp: string, ttlMinutes: number = 10): void => {
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  });
};

export const verifyOTP = (key: string, otp: string): boolean => {
  const stored = otpStore.get(key);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  if (stored.otp === otp) {
    otpStore.delete(key);
    return true;
  }
  return false;
};

