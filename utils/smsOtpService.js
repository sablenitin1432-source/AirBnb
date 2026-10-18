const twilio = require("twilio");

// In-memory OTP storage for payment verification
const paymentOtpStore = new Map();

// Twilio client (initialized only if credentials exist)
let twilioClient = null;
let twilioPhone = null;

function initTwilio() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        console.log("✅ Twilio SMS service initialized");
        return true;
    }
    console.log("⚠️  Twilio credentials not found — SMS OTP will use fallback mode");
    return false;
}

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS
async function sendPaymentOTP(phone, userId) {
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes for payment OTP

    // Store OTP keyed by the user id
    paymentOtpStore.set(String(userId), { otp, expiresAt, phone, attempts: 0 });

    // Ensure phone has country code
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+91" + formattedPhone; // Default to India
    }

    if (twilioClient) {
        try {
            await twilioClient.messages.create({
                body: `🔐 Your Elite Passage payment OTP is: ${otp}. Valid for 5 minutes. Do NOT share this with anyone.`,
                from: twilioPhone,
                to: formattedPhone,
            });
            console.log(`📱 SMS OTP sent to ${formattedPhone}`);
            return { success: true, message: "OTP sent to your phone number" };
        } catch (err) {
            console.error("Twilio SMS error:", err.message);
            return { success: false, message: "Failed to send SMS. Please try again." };
        }
    } else {
        // Fallback: log OTP to console (for development/demo)
        console.log(`📱 [DEMO] Payment OTP for ${formattedPhone}: ${otp}`);
        return { success: true, message: "OTP sent to your phone number", demo: true };
    }
}

// Verify payment OTP
function verifyPaymentOTP(userId, inputOTP) {
    const stored = paymentOtpStore.get(String(userId));

    if (!stored) {
        return { valid: false, message: "No OTP found. Please request a new one." };
    }

    if (Date.now() > stored.expiresAt) {
        paymentOtpStore.delete(String(userId));
        return { valid: false, message: "OTP has expired. Please request a new one." };
    }

    // Max 3 wrong attempts
    if (stored.attempts >= 3) {
        paymentOtpStore.delete(String(userId));
        return { valid: false, message: "Too many wrong attempts. Please request a new OTP." };
    }

    if (stored.otp !== inputOTP) {
        stored.attempts++;
        return { valid: false, message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` };
    }

    // OTP is valid - remove it
    paymentOtpStore.delete(String(userId));
    return { valid: true, message: "OTP verified successfully!" };
}

// Cleanup expired OTPs every 2 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of paymentOtpStore.entries()) {
        if (now > data.expiresAt) {
            paymentOtpStore.delete(key);
        }
    }
}, 2 * 60 * 1000);

module.exports = { initTwilio, sendPaymentOTP, verifyPaymentOTP };
