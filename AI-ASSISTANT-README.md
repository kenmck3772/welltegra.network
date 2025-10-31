# 🤖 Welltegra AI Assistant - Quick Start Guide

Welcome! This guide will help you get the AI Assistant up and running in **under 10 minutes**.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Gemini API Key (2 minutes)

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"**
5. Copy the API key (starts with `AIzaSy...`)

✅ **That's it!** This is FREE with generous limits (1,500 requests/day).

---

### Step 2: Add the API Key to Your Code (1 minute)

Open the file: `assets/js/ai-helper.js`

Find line 24 and replace it:

**Before:**
```javascript
geminiApiKey: "YOUR_GEMINI_API_KEY",
```

**After:**
```javascript
geminiApiKey: "AIzaSyD_your_actual_key_here",  // ← Paste your key here
```

**Save the file.**

---

### Step 3: Test It! (30 seconds)

1. Open `index.html` in your browser
2. Click **"AI Assistant"** in the navigation menu
3. Type: "What is Welltegra?"
4. Press Enter

🎉 **You should see an AI response with sources!**

---

## ✅ You're Done! (Basic Setup)

The AI Assistant is now working in "Offline Mode":
- ✅ AI-powered responses
- ✅ Google Search grounding
- ✅ Source citations
- ⚠️ No message persistence (messages clear on refresh)

**Want to save chat history?** Continue to the Advanced Setup below.

---

## 📊 Advanced Setup: Add Firebase (Optional)

Firebase enables:
- 💾 Message persistence (chat history saved)
- 👤 User authentication
- 🔄 Real-time message sync across devices

### Step 1: Create Firebase Project (3 minutes)

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter name: `welltegra-ai`
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**
6. Wait ~30 seconds, then click **"Continue"**

### Step 2: Add Web App (2 minutes)

1. On project homepage, click the **Web icon** `</>`
2. Enter nickname: `Welltegra Website`
3. **Don't** check Firebase Hosting
4. Click **"Register app"**
5. You'll see code like this - **COPY IT**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC...",
  authDomain: "welltegra-ai-12345.firebaseapp.com",
  projectId: "welltegra-ai-12345",
  storageBucket: "welltegra-ai-12345.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abc123"
};
```

6. Click **"Continue to console"**

### Step 3: Enable Firestore Database (2 minutes)

1. In left sidebar: **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select location (choose closest to you)
5. Click **"Enable"**

### Step 4: Add Firebase Config to Your Code (2 minutes)

Open: `assets/js/ai-helper.js`

Find lines 13-19 and replace with YOUR values:

```javascript
firebaseConfig: {
    apiKey: "AIzaSyABC...",              // ← From Firebase
    authDomain: "welltegra-ai-12345.firebaseapp.com",
    projectId: "welltegra-ai-12345",
    storageBucket: "welltegra-ai-12345.appspot.com",
    messagingSenderId: "987654321",
    appId: "1:987654321:web:abc123"
},
```

**Save the file.**

### Step 5: Deploy Security Rules (2 minutes)

1. Back in Firebase Console: **Firestore Database** → **Rules** tab
2. Replace everything with the contents of `firestore.rules` from this repo
3. Click **"Publish"**

**Security rules are in:** `firestore.rules` (in this repository)

### Step 6: Test Firebase (30 seconds)

1. Refresh your browser (hard refresh: Ctrl+Shift+R)
2. Open AI Assistant
3. Send a message
4. Refresh the page
5. **Messages should still be there!** ✅

---

## 🔐 Security Setup (IMPORTANT!)

Before deploying to production, follow the **SECURITY-SETUP.md** guide to:

1. ✅ Set up HTTP referrer restrictions (Gemini API)
2. ✅ Deploy Firestore security rules
3. ✅ Set up billing alerts
4. ✅ Monitor API usage

**Quick checklist:**

```bash
# Gemini API Security
☐ Add HTTP referrer restrictions in Google Cloud Console
☐ Restrict to only Generative Language API

# Firebase Security
☐ Deploy firestore.rules
☐ Switch from test mode to production mode
☐ Enable billing alerts

# Code Security
☐ Never commit API keys to Git
☐ Use .env files (already in .gitignore)
```

**See full guide:** [SECURITY-SETUP.md](./SECURITY-SETUP.md)

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `assets/js/ai-helper.js` | Main AI Assistant code - **ADD YOUR API KEYS HERE** |
| `firestore.rules` | Firebase security rules - deploy to Firebase Console |
| `SECURITY-SETUP.md` | Complete security guide with step-by-step instructions |
| `.env.example` | Template for environment variables (if using build tools) |
| `.gitignore` | Ensures API keys aren't committed to Git |

---

## ❓ Troubleshooting

### "API key not configured" Error

**Problem:** You see a warning about API key not configured.

**Solution:**
1. Open `assets/js/ai-helper.js`
2. Find line 24: `geminiApiKey: "YOUR_GEMINI_API_KEY"`
3. Replace `YOUR_GEMINI_API_KEY` with your actual key
4. Save and hard refresh (Ctrl+Shift+R)

---

### "Firebase not configured" Error

**Problem:** Messages don't persist after refresh.

**Solution:**
1. Follow the "Advanced Setup: Add Firebase" section above
2. Make sure you copied the ENTIRE Firebase config object
3. Check Firebase Console to ensure Firestore is enabled

---

### "Permission denied" Error in Firestore

**Problem:** Can't read/write messages to Firestore.

**Solution:**
1. Firebase Console → Firestore Database → Rules
2. Make sure rules are deployed from `firestore.rules`
3. Check that rules were published (not just saved)

---

### "Quota exceeded" Error

**Problem:** Hit rate limits on Gemini API.

**Solution:**
1. Free tier allows 1,500 requests/day
2. Check usage: https://console.cloud.google.com/apis/dashboard
3. Consider upgrading to paid tier if needed
4. Implement client-side rate limiting

---

### Messages Not Showing Up

**Problem:** Send messages but they don't appear.

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify Firebase config is correct
4. Check Firestore rules are deployed
5. Ensure user is authenticated (check console logs)

---

## 💰 Cost Estimates

### Free Tier Limits

**Gemini API:**
- ✅ 1,500 requests per day
- ✅ 1 million tokens per minute
- ✅ **FREE forever** for this usage

**Firebase:**
- ✅ 50,000 database reads/day
- ✅ 20,000 database writes/day
- ✅ 1 GB storage
- ✅ **FREE forever** for moderate usage

### Expected Usage

For 100 users with ~10 messages each per day:
- Gemini: ~1,000 requests/day ✅ Under limit
- Firebase: ~2,000 writes, ~5,000 reads ✅ Under limit

**Conclusion:** Should stay 100% FREE for typical usage!

---

## 🎯 Features Overview

### What the AI Can Do

✅ **Search the web** for current Welltegra information
✅ **Answer questions** about well engineering
✅ **Provide sources** for all information
✅ **Format responses** with Markdown
✅ **Remember context** within the conversation
✅ **Save chat history** (with Firebase)

### Example Questions to Ask

- "What is Welltegra Network?"
- "How does Welltegra reduce NPT?"
- "What are the key features of the platform?"
- "Tell me about well intervention planning"
- "What data quality metrics does Welltegra track?"

---

## 🔄 Updating the AI Assistant

To update or customize:

1. **Change AI behavior:** Edit system prompt in `ai-helper.js` line 218
2. **Adjust message limit:** Change Firestore rules max message size
3. **Customize UI:** Edit HTML in `index.html` (search for `ai-helper-view`)
4. **Add features:** Modify `ai-helper.js` functions

---

## 📞 Support Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Google Cloud Console:** https://console.cloud.google.com/

---

## ✅ Quick Checklist

Before deploying:

**Setup**
- [ ] Gemini API key added to `ai-helper.js`
- [ ] Firebase config added (if using persistence)
- [ ] Firestore database created and enabled
- [ ] Security rules deployed from `firestore.rules`

**Security**
- [ ] HTTP referrer restrictions set (Google Cloud Console)
- [ ] API restrictions applied (Generative Language API only)
- [ ] Firestore rules tested in Rules Playground
- [ ] Billing alerts configured

**Testing**
- [ ] AI responds to messages
- [ ] Sources are displayed correctly
- [ ] Messages persist after refresh (with Firebase)
- [ ] No console errors
- [ ] Works on mobile devices

**Production**
- [ ] HTTPS enabled
- [ ] Domain added to HTTP referrer restrictions
- [ ] Monitoring dashboards set up
- [ ] Usage alerts configured

---

## 🎉 You're All Set!

The AI Assistant is ready to help users learn about Welltegra.

**Next steps:**
1. Test thoroughly
2. Set up security (see SECURITY-SETUP.md)
3. Monitor usage
4. Gather user feedback
5. Iterate and improve!

---

**Need help?** Check [SECURITY-SETUP.md](./SECURITY-SETUP.md) for detailed security configuration.

**Last Updated:** 2025-10-31
**Version:** 1.0 (for Welltegra v23.0.18)
