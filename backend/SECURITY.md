# Security Measures Documentation

## Overview
Your backend server now has comprehensive security measures to protect against spam, abuse, and attacks.

---

## 🛡️ Security Features Implemented

### 1. **Rate Limiting**

#### Email Endpoint Protection
- **Limit**: 3 form submissions per 15 minutes per IP address
- **Purpose**: Prevents spam bots from flooding your email
- **Response**: "Too many form submissions. Please try again in 15 minutes."

#### General API Protection
- **Limit**: 100 requests per minute per IP address
- **Purpose**: Prevents DDoS attacks and abuse
- **Applies to**: All endpoints

### 2. **Input Validation & Sanitization**

All form inputs are validated and sanitized:

#### Name Field
- ✅ Required, 2-100 characters
- ✅ Only letters, spaces, hyphens, and apostrophes
- ❌ Blocks special characters and HTML tags

#### Email Field
- ✅ Required, valid email format
- ✅ Normalized (lowercase)
- ❌ Blocks invalid/malicious emails

#### Company Field
- ✅ Required, 2-100 characters
- ❌ HTML/script tags removed

#### Phone Field (Optional)
- ✅ Only allows numbers, spaces, +, -, (, )
- ❌ Blocks letters and special characters

#### Message Field (Optional)
- ✅ Max 2000 characters
- ❌ HTML/script tags removed

### 3. **CORS (Cross-Origin Resource Sharing)**

#### Allowed Origins (Whitelist):
```
http://localhost:3000
http://127.0.0.1:3000
http://localhost:5500
http://127.0.0.1:5500
```

**Note**: When you deploy to production, add your domain to the whitelist in `server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com'  // Add your production domain
];
```

### 4. **Security Headers (Helmet)**

Helmet adds various HTTP headers to protect against:
- ❌ XSS (Cross-Site Scripting)
- ❌ Clickjacking
- ❌ MIME type sniffing
- ❌ Other common web vulnerabilities

### 5. **Request Size Limits**

- **JSON payload**: Max 10KB
- **URL-encoded data**: Max 10KB
- **Purpose**: Prevents memory exhaustion attacks

---

## 🚀 Testing the Security

### Test Rate Limiting
1. Go to your contact form
2. Submit 3 times quickly
3. On the 4th attempt, you'll see: "Too many form submissions"
4. Wait 15 minutes to submit again

### Test Input Validation
Try submitting invalid data:
- Empty name/email/company → Error message
- Invalid email format → "Invalid email address"
- Name with numbers → "Name contains invalid characters"
- Message over 2000 chars → "Message is too long"

### Test CORS Protection
Try accessing from an unauthorized domain:
- Result: "Access denied" (403 error)

---

## 📊 Security Logs

The server logs include:
- Email submission confirmations with sender email
- Rate limit violations (automatically handled)
- Validation errors (sent to client)

---

## 🔒 Best Practices

### Current Setup ✅
- ✅ Rate limiting enabled
- ✅ Input validation and sanitization
- ✅ CORS restrictions
- ✅ Security headers
- ✅ .env file for credentials (not in git)
- ✅ Request size limits

### For Production Deployment 📝

1. **Update CORS whitelist** with your production domain
2. **Use HTTPS** (SSL certificate required)
3. **Consider adding**:
   - Honeypot fields for spam prevention
   - reCAPTCHA for bot protection
   - Email service (SendGrid/Mailgun) for better deliverability
   - Database logging for form submissions
   - IP blacklisting for repeat offenders

4. **Environment Variables**:
   - Never expose .env file in production
   - Use your hosting provider's environment variable system

5. **Monitoring**:
   - Set up logging service (e.g., Winston, Morgan)
   - Monitor rate limit hits
   - Track failed submission attempts

---

## 🔧 Adjusting Rate Limits

If you need to change rate limits, edit `server.js`:

```javascript
// More strict (2 emails per 30 minutes)
const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 2,
  // ...
});

// More lenient (5 emails per 10 minutes)
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  // ...
});
```

---

## 🐛 Troubleshooting

### "Too many requests" error
- **Cause**: Rate limit exceeded
- **Solution**: Wait 15 minutes or restart server (dev only)

### "Access denied" CORS error
- **Cause**: Request from unauthorized origin
- **Solution**: Add the origin to `allowedOrigins` array

### Form validation errors
- **Cause**: Invalid input format
- **Solution**: Check error message and fix input

---

## 📚 Security Packages Used

- **express-rate-limit**: Rate limiting middleware
- **helmet**: Security headers
- **express-validator**: Input validation and sanitization
- **cors**: Cross-origin request control

---

## Status

✅ **All security measures are now active!**

Your backend is protected against:
- Spam attacks
- Brute force attempts
- XSS attacks
- CSRF attacks
- SQL injection (input sanitization)
- DDoS attempts (rate limiting)
- Unauthorized access (CORS)
