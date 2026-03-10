require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: [
    'https://goldenlaneresources.com',
    'https://www.goldenlaneresources.com',
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Rate limiter - 5 emails per 15 minutes
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many submissions. Try again in 15 minutes." }
});

// ============================================================
// 📧 NODEMAILER - cPanel SMTP Configuration
// ============================================================
// .env should look like this (wrap password in double quotes
// if it contains special characters like # " $):
//
//   EMAIL_USER=admin@goldenlaneresources.com
//   EMAIL_PASSWORD="Jiawei7871#"
//   EMAIL_RECIPIENT=admin@goldenlaneresources.com
// ============================================================
const transporter = nodemailer.createTransport({
  host: 'mail.goldenlaneresources.com',
  port: 465,
  secure: true,                  // true for port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false    // needed for self-signed certs on shared hosting
  }
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email config error:", error.message);
    console.log("   → Double-check EMAIL_USER and EMAIL_PASSWORD in .env");
    console.log("   → If password has special chars (#, $, \"), wrap it in double quotes");
  } else {
    console.log("✅ Email server ready");
  }
});

// ============================================================
// 📧 SEND EMAIL ROUTE
// ============================================================
app.post("/send-email",
  emailLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('company').trim().notEmpty().withMessage('Company name required')
  ],
  async (req, res) => {
    console.log('\n📧 Contact form submission received');

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { name, email, company, phone, details } = req.body;
      console.log(`From: ${name} (${email}) at ${company}`);

      const mailOptions = {
        // Sender must be the authenticated cPanel email
        from: `"MTI Resource Enquiry" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECIPIENT,
        // User's email goes in replyTo — hit Reply to respond directly to them
        replyTo: `"${name}" <${email}>`,
        subject: `New Enquiry from ${company}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e3455; color: white; padding: 20px; border-radius: 4px 4px 0 0; }
              .header h2 { margin: 0; font-size: 1.2rem; }
              .content { background: #f7f9fc; padding: 30px; border-radius: 0 0 4px 4px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #0e1c2f; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
              .value { color: #333; padding: 10px; background: white; margin-top: 5px; border-left: 3px solid #1e3455; border-radius: 2px; }
              .footer { margin-top: 20px; color: #999; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📬 New Contact Form Submission</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                <div class="field">
                  <div class="label">Company</div>
                  <div class="value">${company}</div>
                </div>
                ${phone ? `
                <div class="field">
                  <div class="label">Phone</div>
                  <div class="value">${phone}</div>
                </div>
                ` : ''}
                ${details ? `
                <div class="field">
                  <div class="label">Message</div>
                  <div class="value">${details.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                <div class="footer">
                  Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' })} (MYT)<br>
                  <em>Hit Reply to respond directly to ${name}.</em>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('📤 Sending email...');
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent!');

      res.json({
        success: true,
        message: "Thank you! We'll contact you within 1 working day."
      });

    } catch (error) {
      console.error("❌ Email error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to send. Please try again or contact us directly."
      });
    }
  }
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Debug: verify env vars are loaded
app.get("/test-email-config", (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing",
    EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT ? "✅ Set" : "❌ Missing"
  });
});

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'Home.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Server Started');
  console.log('========================================');
  console.log(`Port     : ${PORT}`);
  console.log(`Sender   : ${process.env.EMAIL_USER || '❌ Not set'}`);
  console.log(`Recipient: ${process.env.EMAIL_RECIPIENT || '❌ Not set'}`);
  console.log('========================================\n');
});