const nodemailer = require("nodemailer");

// In-memory OTP storage (in production, use Redis or DB)
const otpStore = new Map();

// Check if email service is configured
function isEmailConfigured() {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

// Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use App Password, NOT your Gmail password
        },
    });
}

// Send OTP email (returns null if email is not configured)
async function sendOTP(email, username) {
    if (!isEmailConfigured()) {
        console.log("⚠️ EMAIL_USER/EMAIL_PASS not set — skipping OTP verification");
        return null;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiry
    otpStore.set(email, { otp, expiresAt, username });

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Elite Passage" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔐 Your Elite Passage Verification Code",
        html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); padding: 40px 32px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">✨</div>
          <h1 style="color: #C9A227; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px;">Elite Passage</h1>
          <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 8px 0 0; letter-spacing: 0.5px;">Email Verification</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 32px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Hello <strong>${username}</strong>,</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
            Welcome to Elite Passage! Use the verification code below to complete your signup. This code is valid for <strong>10 minutes</strong>.
          </p>

          <!-- OTP Code Box -->
          <div style="background: linear-gradient(135deg, #f8f6f0 0%, #faf9f5 100%); border: 2px dashed #C9A227; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Your Verification Code</p>
            <div style="font-size: 40px; font-weight: 700; color: #1A1A1A; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</div>
          </div>

          <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
            If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8f8f8; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #bbb; font-size: 11px; margin: 0;">© 2026 Elite Passage. All rights reserved.</p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}`);
    return otp;
}

// Verify OTP
function verifyOTP(email, inputOTP) {
    const stored = otpStore.get(email);

    if (!stored) {
        return { valid: false, message: "No OTP found. Please request a new one." };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return { valid: false, message: "OTP has expired. Please request a new one." };
    }

    if (stored.otp !== inputOTP) {
        return { valid: false, message: "Invalid OTP. Please try again." };
    }

    // OTP is valid — remove it
    otpStore.delete(email);
    return { valid: true, message: "OTP verified successfully!" };
}

// Get pending signup data
function getPendingData(email) {
    const stored = otpStore.get(email);
    return stored ? { username: stored.username } : null;
}

// Cleanup expired OTPs periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiresAt) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

module.exports = { sendOTP, verifyOTP, getPendingData, isEmailConfigured };
