# Email Notification Setup Guide

## Overview
This backend server handles contact form submissions and sends email notifications using Node.js, Express, and Nodemailer.

## Prerequisites
- Node.js installed (v14 or higher)
- A Gmail account for sending emails
- Git (optional)

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

## Gmail App Password Setup

To send emails via Gmail, you need to create an **App Password**:

1. Go to your Google Account: https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Select app: **Mail**
5. Select device: **Windows Computer** (or your device)
6. Click **Generate**
7. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

## Configuration

1. Open the `.env` file in the backend folder
2. Replace the placeholder values with your actual credentials:

```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_RECIPIENT=youremail@gmail.com
PORT=3000
```

**Important:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: The 16-character App Password (remove spaces)
- `EMAIL_RECIPIENT`: Email where you want to receive notifications (can be same as EMAIL_USER)

## Running the Server

1. Start the server:
   ```bash
   node server.js
   ```

2. You should see:
   ```
   Server running on http://localhost:3000
   Email server is ready to send messages
   ```

3. Keep the server running while testing the contact form

## Testing

1. Open your website's Contact page in a browser
2. Fill out the contact form with test data
3. Click "Submit Enquiry"
4. Check your email inbox for the notification

## Troubleshooting

### "Email transporter error"
- Make sure you've enabled 2-Step Verification on your Google account
- Verify the App Password is correct (16 characters, no spaces)
- Check that `EMAIL_USER` matches the Gmail account that generated the App Password

### "Failed to send message"
- Ensure the server is running (`node server.js`)
- Check the terminal for error messages
- Verify your internet connection

### Form submission fails
- Make sure the server is running on port 3000
- Check browser console for errors (F12)
- Verify the fetch URL in Contact.html matches your server URL

### Email not received
- Check your spam/junk folder
- Verify `EMAIL_RECIPIENT` is correct in .env
- Check server terminal for "Email sent successfully" message

## Production Deployment

For production, you should:

1. Use environment variables from your hosting provider
2. Change the fetch URL in Contact.html from `localhost:3000` to your production API URL
3. Enable HTTPS
4. Consider using a dedicated email service like SendGrid or Mailgun for better deliverability

## Email Format

The notification email includes:
- Sender's name
- Email address (with reply-to functionality)
- Company name
- Phone number (if provided)
- Message details (if provided)
- Timestamp

## Security Notes

- **Never commit the `.env` file to Git** (it's already in .gitignore)
- Keep your App Password secure
- The `.env.example` file shows the format without real credentials
- Consider rate limiting for production to prevent spam

## Support

If you need help, check:
- Server terminal logs for detailed error messages
- Browser console (F12) for client-side errors
- Gmail account settings to ensure App Password is active
