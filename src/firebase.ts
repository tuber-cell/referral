import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, getDoc, where, getDocs, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Referral System Functions
export const referralSystem = {
  // Track a new referral (when someone signs up with a promo code)
  trackReferral: async (referrerId: string, referredEmail: string) => {
    try {
      const referralRef = doc(collection(db, 'users', referrerId, 'referrals'));
      await setDoc(referralRef, {
        email: referredEmail,
        date: new Date().toISOString(),
        status: 'pending',
        points: 0
      });
      return true;
    } catch (error) {
      console.error('Error tracking referral:', error);
      return false;
    }
  },

  // Complete a referral (when referred user subscribes)
  completeReferral: async (referrerId: string, subscriptionId: string) => {
    try {
      // Find the pending referral for the referrer
      const referralsRef = collection(db, 'users', referrerId, 'referrals');
      const q = query(
        referralsRef,
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Use the first pending referral (assuming one per referrer is active)
        const referralDoc = querySnapshot.docs[0];
        await updateDoc(referralDoc.ref, {
          status: 'completed',
          points: 2,
          completedAt: new Date().toISOString(),
          subscriptionId
        });
        
        // Update the referrer's points
        const userRef = doc(db, 'users', referrerId);
        await updateDoc(userRef, {
          points: increment(2),
          referrals: increment(1)
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing referral:', error);
      return false;
    }
  },

  // Validate a promo code
  validatePromoCode: async (promoCode: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('promoCode', '==', promoCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return {
          valid: true,
          referrerId: querySnapshot.docs[0].id,
          referrerData: querySnapshot.docs[0].data()
        };
      }
      return { valid: false };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return { valid: false };
    }
  },

  // Get user's promo code
  getUserPromoCode: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().promoCode || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting promo code:', error);
      return null;
    }
  }
};