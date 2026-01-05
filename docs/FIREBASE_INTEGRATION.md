# Firebase Integration Guide (Free Tier)

**Project**: brahan-483303
**Goal**: Add authentication, real-time database, and user tracking to your Brahan Engine

---

## 🎯 Why Firebase?

Firebase offers generous **free tier limits** that complement your existing GCP setup:

### Firebase Free Tier (Spark Plan)
- **Authentication**: Unlimited users (email, Google, anonymous)
- **Firestore**: 50K reads/day, 20K writes/day, 1GB storage
- **Realtime Database**: 10GB storage, 100 simultaneous connections
- **Hosting**: 10GB storage, 360MB/day transfer
- **Cloud Functions**: 125K invocations/day
- **Analytics**: Unlimited events

**Cost**: $0.00/month (stays within free limits)

---

## 🔥 What You Can Add with Firebase

### 1. **User Authentication**
- Google Sign-in (one-click login)
- Email/password authentication
- Anonymous users (for demo mode)
- User profiles and preferences

### 2. **Real-Time Data Sync**
- Well monitoring dashboard (live updates)
- Multi-user collaboration
- Intervention history tracking
- User action logs

### 3. **User Preferences Storage**
- Save physics mode settings
- Custom alert thresholds
- Dashboard layouts
- Training completion status

### 4. **Analytics**
- Track which features users actually use
- A/B testing (voice commands vs. manual)
- User engagement metrics

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase (uses your Google account)
firebase login

# Initialize Firebase in your existing GCP project
firebase projects:add brahan-483303

# Select brahan-483303 from the list
```

### Step 2: Add Firebase to React App

```bash
cd /home/user/welltegra.network/react-brahan-vertex

# Install Firebase SDK
npm install firebase

# Initialize Firebase config
firebase init
# Select:
#   - Firestore
#   - Authentication
#   - Hosting (optional - you already use GitHub Pages)
```

### Step 3: Create Firebase Config

Create `react-brahan-vertex/src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Get from Firebase Console
  authDomain: "brahan-483303.firebaseapp.com",
  projectId: "brahan-483303",
  storageBucket: "brahan-483303.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
```

**Get config values**:
1. Go to: https://console.firebase.google.com
2. Select brahan-483303
3. Click ⚙️ Settings > Project settings
4. Scroll to "Your apps" > Web app > Config

---

## 💡 Use Case Examples

### Example 1: Google Sign-In

Add to `App.js`:

```javascript
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      )}
    </div>
  );
}
```

**Cost**: $0.00 (unlimited users in free tier)

---

### Example 2: Save User Preferences

```javascript
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Save user's physics mode preference
async function savePhysicsMode(userId, physicsMode) {
  await setDoc(doc(db, 'users', userId), {
    physicsMode: physicsMode,
    updatedAt: new Date()
  }, { merge: true });
}

// Load user's preferences
async function loadUserPreferences(userId) {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

// Usage in App.js
const [physicsMode, setPhysicsMode] = useState(false);

useEffect(() => {
  if (user) {
    loadUserPreferences(user.uid).then((prefs) => {
      if (prefs) {
        setPhysicsMode(prefs.physicsMode || false);
      }
    });
  }
}, [user]);

const handlePhysicsModeToggle = async (newValue) => {
  setPhysicsMode(newValue);
  if (user) {
    await savePhysicsMode(user.uid, newValue);
  }
};
```

**Cost**: $0.00 (well under 20K writes/day limit)

---

### Example 3: Track Intervention History

```javascript
import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

// Log intervention action
async function logIntervention(userId, wellId, action, reasoning) {
  await addDoc(collection(db, 'interventions'), {
    userId,
    wellId,
    action,
    reasoning,
    timestamp: new Date(),
    outcome: null // Update later with results
  });
}

// Get user's intervention history
async function getInterventionHistory(userId) {
  const q = query(
    collection(db, 'interventions'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Usage
const handleExecutionAttempt = async () => {
  const bravoWell = wells.find(w => w.id === 'well-bravo');

  if (physicsMode && bravoWell && bravoWell.safetyLocked) {
    // Log the intervention attempt
    await logIntervention(
      user.uid,
      'well-bravo',
      'BLOCKED',
      'Physics mode violation - redirected to training'
    );

    setTrainingReason('Procedural Violation Detected...');
    setShowTraining(true);
    return false;
  }

  return true;
};
```

**Cost**: $0.00 (under 50K reads/day, 20K writes/day limits)

---

### Example 4: Real-Time Well Monitoring

```javascript
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Real-time listener for well status updates
useEffect(() => {
  if (!selectedWell) return;

  const unsubscribe = onSnapshot(
    doc(db, 'wells', selectedWell.id),
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const liveData = docSnapshot.data();
        setWellLiveData(liveData);
      }
    }
  );

  return unsubscribe; // Cleanup on unmount
}, [selectedWell]);

// Update well status (from Cloud Run API or manual)
async function updateWellStatus(wellId, pressure, watercut) {
  await setDoc(doc(db, 'wells', wellId), {
    pressure,
    watercut,
    lastUpdated: new Date()
  }, { merge: true });
}
```

**Cost**: $0.00 (100 simultaneous connections free)

---

## 🔒 Firebase Security Rules

Set up Firestore rules to protect user data:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read well data (public demo)
    match /wells/{wellId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Users can read their own intervention history
    match /interventions/{docId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Firebase + Cloud Run Integration

Connect Firebase auth with your Cloud Run API:

```python
# gcp-free-tier-api/main.py
from firebase_admin import credentials, auth, initialize_app

# Initialize Firebase Admin SDK
cred = credentials.ApplicationDefault()
initialize_app(cred)

@app.route('/api/wells-protected', methods=['GET'])
def get_wells_protected():
    """Protected endpoint - requires Firebase auth token"""

    # Get token from header
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({'error': 'No authorization header'}), 401

    try:
        # Verify Firebase ID token
        id_token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # User is authenticated - return data
        query = f"SELECT * FROM `brahan-483303.wells.well_data`"
        results = client.query(query).to_dataframe()

        return jsonify({
            'success': True,
            'userId': uid,
            'wells': results.to_dict('records')
        })

    except Exception as e:
        return jsonify({'error': 'Invalid token'}), 401
```

**Cost**: $0.00 (token verification is free)

---

## 💰 Free Tier Limits Summary

| Service | Free Tier | Your Expected Usage | Cost |
|---------|-----------|---------------------|------|
| **Authentication** | Unlimited users | ~10-100 users | **$0.00** |
| **Firestore Reads** | 50K/day | ~1K/day | **$0.00** |
| **Firestore Writes** | 20K/day | ~200/day | **$0.00** |
| **Firestore Storage** | 1GB | ~10MB | **$0.00** |
| **Cloud Functions** | 125K/day | ~500/day | **$0.00** |
| **Analytics** | Unlimited | Unlimited | **$0.00** |
| **TOTAL** | | | **$0.00/month** |

---

## 🎯 Recommended Firebase Features for Your Project

### Must-Have (High Value, Zero Cost)
1. ✅ **Google Authentication** - One-click login for users
2. ✅ **Firestore User Preferences** - Save physics mode, alerts, settings
3. ✅ **Analytics** - Track feature usage (voice commands vs manual)

### Nice-to-Have (Medium Value, Zero Cost)
4. ✅ **Intervention History** - Log all user actions for ML training data
5. ✅ **Real-time Sync** - Multi-tab synchronization
6. ✅ **Anonymous Auth** - Demo mode without signup

### Advanced (Low Priority)
7. ⏳ **Cloud Functions** - Automated email alerts
8. ⏳ **Firebase Hosting** - Alternative to GitHub Pages
9. ⏳ **Remote Config** - A/B test features without redeployment

---

## 🚀 Quick Start Commands

```bash
# 1. Install Firebase tools
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Add to existing GCP project
firebase projects:add brahan-483303

# 4. Install in React app
cd react-brahan-vertex
npm install firebase

# 5. Initialize Firebase
firebase init
# Select: Authentication, Firestore

# 6. Deploy security rules
firebase deploy --only firestore:rules

# Done! Cost: $0.00/month
```

---

## 📖 Next Steps

1. **Enable Authentication** in Firebase Console
   - Go to Authentication > Sign-in method
   - Enable "Google"
   - Add authorized domain: `welltegra.network`

2. **Create Firestore Database**
   - Go to Firestore Database > Create database
   - Choose "Start in production mode"
   - Select `us-central` (or your preferred region)

3. **Add Firebase to React App**
   - Create `src/firebase.js` with config
   - Add authentication UI
   - Save user preferences

4. **Update Cloud Run API**
   - Install `firebase-admin`
   - Verify tokens in protected endpoints

5. **Deploy and Test**
   - Test Google sign-in
   - Test data sync
   - Monitor usage in Firebase Console

---

**Firebase adds powerful features for $0.00/month. Want me to create the integration code?**
