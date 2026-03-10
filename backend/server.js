require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow inline styles in emails
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration - only allow specific origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      process.env.FRONTEND_URL,
      // Production domains:
      'https://goldenlaneresources.com',
      'https://www.goldenlaneresources.com',
      'http://goldenlaneresources.com',
      'http://www.goldenlaneresources.com'
    ].filter(Boolean); // Remove undefined values
    
    // Log all CORS requests for debugging
    console.log(`CORS request from origin: ${origin}`);
    console.log(`Allowed origins:`, allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✓ CORS allowed for: ${origin}`);
      callback(null, true);
    } else {
      // Log rejected origins for debugging
      console.log(`✗ CORS blocked origin: ${origin}`);
      console.log(`Make sure to add this origin to allowedOrigins in server.js`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate Limiter for Email Endpoint - Prevent Spam
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: "Too many form submissions. Please try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General Rate Limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Body Parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Input Sanitization Helper
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  // Remove potentially dangerous characters
  return input
    .replace(/[<>"']/g, '') // Remove HTML/script tags
    .trim()
    .substring(0, 1000); // Limit length
}

// Route for form submission with rate limiting and validation
app.post("/send-email", 
  emailLimiter, // Apply rate limiting
  [
    // Validation middleware
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters')
      .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('company')
      .trim()
      .notEmpty().withMessage('Company name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2-100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[+\d\s()-]+$/).withMessage('Invalid phone number format'),
    body('details')
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage('Message is too long (max 2000 characters)')
  ],
  async (req, res) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg // Return first error
        });
      }

      const { name, email, company, phone, details } = req.body;

      // Additional sanitization
      const sanitizedData = {
        name: sanitizeInput(name),
        email: email.toLowerCase(),
        company: sanitizeInput(company),
        phone: phone ? sanitizeInput(phone) : '',
        details: details ? sanitizeInput(details) : ''
      };

    // Email options with sanitized data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
      replyTo: sanitizedData.email,
      subject: `New Contact Form Submission from ${sanitizedData.company}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e3455; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f7f9fc; padding: 30px; border: 1px solid #e2e8f2; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #0e1c2f; display: block; margin-bottom: 5px; }
            .value { color: #4a6080; padding: 10px; background: white; border-radius: 4px; }
            .footer { background: #0e1c2f; color: #8fa3bc; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Name:</span>
                <div class="value">${sanitizedData.name}</div>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <div class="value"><a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></div>
              </div>
              <div class="field">
                <span class="label">Company:</span>
                <div class="value">${sanitizedData.company}</div>
              </div>
              ${sanitizedData.phone ? `
              <div class="field">
                <span class="label">Phone:</span>
                <div class="value">${sanitizedData.phone}</div>
              </div>
              ` : ''}
              ${sanitizedData.details ? `
              <div class="field">
                <span class="label">Message:</span>
                <div class="value">${sanitizedData.details.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              MTI Resource - Received on ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId} from ${sanitizedData.email}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Email sent successfully! We'll get back to you within 1 working day." 
    });

  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send email. Please try again or contact us directly." 
    });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'Home.html'));
});

// Error handling for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } else {
    next(err);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Security measures enabled`);
  console.log(`✓ Rate limiting: 3 emails per 15 minutes per IP`);
  console.log(`✓ Open http://localhost:${PORT} to view your website`);
});
