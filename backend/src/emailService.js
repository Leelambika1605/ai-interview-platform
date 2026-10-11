
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(email, otp) {
  return transporter.sendMail({
    from: `"AI Mock Interview Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 5 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
        <h2>Password Reset</h2>
        <p>Use this one-time password to reset your AI Mock Interview Platform account:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 0;">
          ${otp}
        </div>
        <p>This OTP expires in <strong>5 minutes</strong>.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
