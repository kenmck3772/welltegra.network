# 🔐 Security Setup Guide for Welltegra AI Assistant

This guide will help you properly secure your Firebase and Gemini API credentials.

---

## 📋 Table of Contents

1. [Firebase Security Rules](#1-firebase-security-rules)
2. [Gemini API Restrictions](#2-gemini-api-restrictions)
3. [Environment Variables (Optional)](#3-environment-variables-optional)
4. [Security Best Practices](#4-security-best-practices)
5. [Monitoring and Alerts](#5-monitoring-and-alerts)

---

## 1. Firebase Security Rules

### Why Security Rules Matter

Without proper security rules, anyone could:
- Read all users' chat messages
- Write unlimited messages to your database
- Cause excessive billing

### Deploy Firestore Security Rules

**Step 1: Open Firebase Console**
1. Go to https://console.firebase.google.com/
2. Select your project (e.g., "welltegra-ai")

**Step 2: Navigate to Firestore Rules**
1. Click **"Firestore Database"** in the left sidebar
2. Click the **"Rules"** tab at the top

**Step 3: Replace Default Rules**

Copy the contents of `firestore.rules` from this repository and paste it into the Firebase Console:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidMessage() {
      return request.resource.data.keys().hasAll(['text', 'role', 'timestamp'])
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 10000
        && request.resource.data.role in ['user', 'model']
        && request.resource.data.timestamp == request.time;
    }

    // AI Assistant Messages - users can only access their own messages
    match /artifacts/{appId}/users/{userId}/messages/{messageId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && isValidMessage();
      allow update, delete: if false;  // Chat history is immutable
    }

    // User metadata
    match /artifacts/{appId}/users/{userId}/metadata/{document=**} {
      allow read, write: if isOwner(userId);
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Step 4: Publish Rules**
1. Click **"Publish"** button
2. Confirm the changes

**What These Rules Do:**
- ✅ Users can only read/write their own messages
- ✅ Messages must have valid structure (text, role, timestamp)
- ✅ Messages limited to 10KB max size
- ✅ Chat history is immutable (no edits/deletes)
- ✅ All other access denied by default

---

## 2. Gemini API Restrictions

### Why API Restrictions Matter

Without restrictions, if someone gets your API key:
- They could use it from any website
- You could hit rate limits or incur costs
- Your quota could be exhausted

### Set Up Application Restrictions

**Step 1: Open Google Cloud Console**
1. Go to https://console.cloud.google.com/
2. Select your project (same project where you created the API key)

**Step 2: Navigate to API Credentials**
1. Click the menu (☰) in top-left
2. Go to **"APIs & Services" > "Credentials"**
3. Find your Gemini API key in the list
4. Click on the API key name to edit it

**Step 3: Add HTTP Referrer Restriction**

1. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**

2. Click **"Add an item"** and add your domains:

```
https://welltegra.network/*
http://localhost:*
http://127.0.0.1:*
file:///*
```

**Explanation:**
- `https://welltegra.network/*` - Your production domain
- `http://localhost:*` - Local development
- `http://127.0.0.1:*` - Local development (alternative)
- `file:///*` - Opening HTML file directly (optional, remove in production)

3. Click **"Save"**

**Step 4: Restrict API Access (Optional but Recommended)**

1. Scroll down to **"API restrictions"**
2. Select **"Restrict key"**
3. From the dropdown, select only:
   - ✅ **Generative Language API**
4. Click **"Save"**

**What These Restrictions Do:**
- ✅ API key only works from your specified domains
- ✅ API key can't be used from other websites
- ✅ Limits exposure if key is leaked
- ✅ Prevents unauthorized usage

---

## 3. Environment Variables (Optional)

For better security in production, consider using environment variables or a backend proxy.

### Option A: Environment Variables (Build-time)

If using a build tool like Vite, Webpack, or Parcel:

**Create `.env` file:**
```bash
VITE_GEMINI_API_KEY=your_actual_key_here
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config values
```

**Update `ai-helper.js`:**
```javascript
const AI_CONFIG = {
    firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        // ...
    },
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    // ...
};
```

**Create `.gitignore`:**
```
.env
.env.local
```

### Option B: Backend Proxy (Most Secure)

For maximum security, create a backend API that:
1. Keeps API keys on the server
2. Authenticates users
3. Proxies requests to Gemini API
4. Implements rate limiting

**This requires:**
- Node.js/Python/etc. backend server
- Server-side API key management
- CORS configuration
- More complex deployment

---

## 4. Security Best Practices

### ✅ Dos

1. **Enable Firebase Authentication**
   - Require users to sign in (even anonymously)
   - Track usage per user

2. **Set Up Budget Alerts**
   - Firebase: Set spending limits
   - Google Cloud: Set up billing alerts

3. **Monitor API Usage**
   - Check Firebase usage dashboard regularly
   - Monitor Gemini API quota usage

4. **Use HTTPS**
   - Deploy your site with HTTPS
   - Firebase Hosting provides free SSL

5. **Rotate Keys Periodically**
   - Create new API keys every 6-12 months
   - Delete old keys after rotation

### ❌ Don'ts

1. **Never commit API keys to Git**
   - Use `.gitignore` for `.env` files
   - Remove keys from code history if committed

2. **Don't use test mode indefinitely**
   - Firebase test mode expires after 30 days
   - Switch to proper security rules before then

3. **Don't share API keys**
   - Keep them confidential
   - Don't post in Slack, Discord, etc.

4. **Don't skip monitoring**
   - Unexpected usage could indicate abuse
   - Set up alerts early

---

## 5. Monitoring and Alerts

### Firebase Monitoring

**Set Usage Alerts:**

1. Go to Firebase Console > **Settings** (⚙️)
2. Click **"Usage and billing"** tab
3. Click **"Details & settings"**
4. Set up **billing budget alerts**:
   - Budget amount: $10/month (or your preferred limit)
   - Alert threshold: 50%, 90%, 100%

**Monitor Firestore Usage:**

1. Firebase Console > **Firestore Database**
2. Click **"Usage"** tab
3. Monitor:
   - Document reads/writes
   - Storage usage
   - Network egress

### Gemini API Monitoring

**View Quota Usage:**

1. Go to https://console.cloud.google.com/
2. Navigate to **"APIs & Services" > "Dashboard"**
3. Click on **"Generative Language API"**
4. Click **"Quotas"** tab
5. Monitor daily requests and tokens

**Set Up Billing Alerts:**

1. Google Cloud Console menu (☰)
2. **"Billing" > "Budgets & alerts"**
3. Click **"Create budget"**
4. Set budget amount and alert thresholds

---

## 6. Quick Security Checklist

Before going live, make sure you've completed:

### Firebase
- [ ] Deployed Firestore security rules (from `firestore.rules`)
- [ ] Switched from test mode to production mode
- [ ] Enabled anonymous authentication
- [ ] Set up billing budget alerts
- [ ] Reviewed usage dashboard

### Gemini API
- [ ] Added HTTP referrer restrictions
- [ ] Restricted API to only Generative Language API
- [ ] Set up quota monitoring
- [ ] Configured billing alerts
- [ ] Tested API key restrictions work

### Code
- [ ] No API keys committed to Git
- [ ] `.env` file in `.gitignore` (if using)
- [ ] HTTPS enabled on production domain
- [ ] Error handling for API failures
- [ ] Rate limiting on client side

---

## 7. Testing Your Security

### Test Firestore Rules

1. Firebase Console > **Firestore Database** > **Rules**
2. Click **"Rules Playground"** tab
3. Test various scenarios:

```javascript
// Should SUCCEED: User reading their own messages
match /artifacts/welltegra-ai-assistant/users/user123/messages/msg1
authenticated: yes, uid: user123
read: allow

// Should FAIL: User reading someone else's messages
match /artifacts/welltegra-ai-assistant/users/user456/messages/msg1
authenticated: yes, uid: user123
read: deny
```

### Test API Restrictions

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try making a request from a different domain:

```javascript
// This should FAIL if restrictions are set up correctly
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_KEY', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({contents: [{parts: [{text: 'test'}]}]})
})
```

4. From an unauthorized domain, you should see: `403 Forbidden` error

---

## 8. What to Do If Your Key Is Compromised

If you suspect your API key has been leaked:

### Immediate Actions

1. **Revoke the key immediately**
   - Google Cloud Console > Credentials
   - Delete the compromised key

2. **Create a new key**
   - Generate new API key
   - Apply same restrictions
   - Update your code with new key

3. **Review usage logs**
   - Check for unusual activity
   - Monitor for unexpected charges

4. **Update security**
   - Strengthen restrictions
   - Consider backend proxy approach
   - Rotate Firebase credentials if needed

---

## 9. Cost Estimates

### Free Tier Limits

**Firebase (Spark Plan - Free):**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage
- 10 GB/month network egress

**Gemini API (Free Tier):**
- 1,500 requests/day
- 1 million tokens/minute
- 1.5 billion tokens/month

### Expected Usage for Welltegra AI

Assuming 100 users with ~10 messages each per day:

**Firebase:**
- Writes: ~2,000/day (well under 20,000 limit)
- Reads: ~5,000/day (well under 50,000 limit)
- Storage: ~10 MB (well under 1 GB limit)

**Gemini API:**
- Requests: ~1,000/day (well under 1,500 limit)
- Tokens: ~200,000/day (well under limits)

**Conclusion:** Should stay within free tier for moderate usage.

---

## 10. Next Steps

1. **Deploy Firebase security rules** (copy from `firestore.rules`)
2. **Set up Gemini API restrictions** (follow Section 2)
3. **Configure monitoring alerts** (follow Section 5)
4. **Test everything** (follow Section 7)
5. **Monitor usage** for first few days
6. **Adjust rules/limits** as needed

---

## 📞 Support

If you encounter issues:

- **Firebase Documentation:** https://firebase.google.com/docs/firestore/security/get-started
- **Gemini API Documentation:** https://ai.google.dev/docs
- **Google Cloud Support:** https://cloud.google.com/support

---

## 📄 License

This security configuration is provided as-is. Always review and test security rules before deploying to production.

---

**Last Updated:** 2025-10-31
**Version:** 1.0 (for Welltegra v23.0.18)
