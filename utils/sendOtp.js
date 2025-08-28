const crypto = require("crypto");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtp(user) {
  const otpCode = crypto.randomInt(100000, 999999).toString();

  // Upsert OTP record
  await Otp.findOneAndUpdate(
    { userId: user._id },
    {
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    },
    { upsert: true, new: true }
  );

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify your account",
    text: `Your OTP code is ${otpCode}. It will expire in 10 minutes.`,
  });
}

module.exports = sendOtp;
