// Ensure we load the backend .env explicitly so credentials are available
require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

// Create transporter consistent with sendEmail.js logic
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to SMTP server:', error);
  } else {
    console.log('SMTP transporter ready to send emails');
  }
});

async function testEmail() {
  try {
    const fromAddr = process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`;
    const toAddr = process.env.EMAIL_TO || process.env.EMAIL_USER;

    const info = await transporter.sendMail({
      from: `"Test" <${fromAddr}>`,
      to: toAddr,
      subject: "SMTP Test",
      text: "\u2705 SMTP connection test",
    });
    console.log('Email sent:', info && info.response ? info.response : info);
  } catch (err) {
    console.error("Email error:", err);
  }
}

testEmail();
