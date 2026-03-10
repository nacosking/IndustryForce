require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");

const app = express();

// ============================================================
// 🔍 LOGGING MIDDLEWARE - Track every request
// ============================================================
app.use((req, res, next) => {
  console.log('\n========================================');
  console.log(`[${new Date().toISOString()}]`);
  console.log(`📥 ${req.method} ${req.path}`);
  console.log(`Origin: ${req.get('origin') || 'NO ORIGIN'}`);
  console.log(`Referer: ${req.get('referer') || 'NO REFERER'}`);
  console.log(`User-Agent: ${req.get('user-agent')?.substring(0, 50)}...`);
  console.log(`IP: ${req.ip}`);
  console.log(`Headers:`, {
    host: req.get('host'),
    'content-type': req.get('content-type'),
    'access-control-request-method': req.get('access-control-request-method'),
    'access-control-request-headers': req.get('access-control-request-headers')
  });
  console.log('========================================\n');
  next();
});

// ✅ FIX 1: Trust proxy - Required when running behind Nginx/Apache/Cloudflare
// Without this, express-rate-limit sees the proxy IP, not the real client IP
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`\n[CORS] Request from: '${origin}'`); // Added quotes to see exactly what is passed
    
    // Allow requests with no origin, or when origin is passed as the string "null"
    if (!origin || origin === 'null') {
      console.log('[CORS] ✓ Allowed: No origin or null');
      return callback(null, true);
    }

    // Explicit allowed origins list
    const allowedOrigins = [
      'https://goldenlaneresources.com',
      'https://www.goldenlaneresources.com',
      'http://goldenlaneresources.com',      
      'http://www.goldenlaneresources.com',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5500',
    ];
    
    // Clean up the origin by removing any trailing slashes just in case
    const cleanOrigin = origin.replace(/\/$/, "");
    
    if (allowedOrigins.includes(cleanOrigin)) {
      console.log(`[CORS] ✓ Allowed: ${cleanOrigin}`);
      callback(null, true);
    } else {
      console.log(`[CORS] ✗ Blocked: ${cleanOrigin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ FIX 3: Explicitly handle OPTIONS preflight for /send-email
// Some proxies/servers strip or block OPTIONS requests
app.options('/send-email', cors(corsOptions));

// Rate Limiter for Email Endpoint
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many form submissions. Please try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
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
  return input
    .replace(/[<>"']/g, '')
    .trim()
    .substring(0, 1000);
}

// Route for form submission
app.post("/send-email", 
  emailLimiter,
  [
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg
        });
      }

      const { name, email, company, phone, details } = req.body;

      const sanitizedData = {
        name: sanitizeInput(name),
        email: email.toLowerCase(),
        company: sanitizeInput(company),
        phone: phone ? sanitizeInput(phone) : '',
        details: details ? sanitizeInput(details) : ''
      };

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
                Golden Lane Resources - Received on ${new Date().toLocaleString()}
              </div>
            </div>
          </body>
          </html>
        `
      };

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
  }
);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'html', 'Home.html'));
});

// CORS error handler
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Security measures enabled`);
  console.log(`✓ Rate limiting: 3 emails per 15 minutes per IP`);
  console.log(`✓ Open http://localhost:${PORT} to view your website`);
});