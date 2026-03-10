# 🚨 Backend Not Running - Quick Fix

## The Problem
Your website on **https://goldenlaneresources.com** is trying to send emails, but there's no backend server running to handle the requests.

## ✅ Quick Solution: Deploy Backend to Render.com (Free)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repos

### Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Select your **IndustryForce** repository
3. Configure:
   - **Name:** `goldenlane-backend`
   - **Region:** Choose closest to you
   - **Branch:** `master`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### Step 3: Add Environment Variables
Click **"Environment"** tab and add:
```
EMAIL_USER = teohyihern28@gmail.com
EMAIL_PASSWORD = yfrq apdk xaxi xhbe
EMAIL_RECIPIENT = teohyihern28@gmail.com
PORT = 3000
FRONTEND_URL = https://goldenlaneresources.com
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (2-3 minutes)
3. Copy your backend URL (e.g., `https://goldenlane-backend.onrender.com`)

### Step 5: Update Frontend Config
Edit `javascript/config.js` line 9:
```javascript
baseUrl: 'https://goldenlane-backend.onrender.com',  // Your Render URL
```

### Step 6: Commit and Push
```powershell
git add javascript/config.js
git commit -m "Update backend URL"
git push origin master
```

### Step 7: Test
1. Visit https://goldenlaneresources.com/html/Contact.html
2. Fill out form
3. Submit
4. Should work! ✅

---

## Alternative: Run Backend on Your Current Server

**If you have SSH access to goldenlaneresources.com server:**

```bash
# Upload backend folder to server
# SSH into server
cd backend
npm install
node server.js

# To keep running after logout, use PM2:
npm install -g pm2
pm2 start server.js --name goldenlane-backend
pm2 save
```

---

## Quick Test (5 minutes)

Want to test if everything else works? Run backend locally temporarily:

```powershell
# In new terminal
cd backend
node server.js
```

Then visit http://localhost:3000/html/Contact.html (note: localhost, not goldenlaneresources.com)

This confirms the form works - just needs proper deployment!

---

## 📊 Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Render.com** | Free | Easy setup, auto-deploy | Goes to sleep after 15 min inactivity (free tier) |
| **Same server** | $0 | Always running, same domain | Requires SSH access |
| **Railway.app** | $5/mo | Always running, fast | Not free |

---

Let me know which option you want to use and I'll help you through it!
