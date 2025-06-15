import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Added getDoc here
import { db } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  currentUserData: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

function generatePromoCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (currentUser?.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setCurrentUserData(docSnap.data());
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (!docSnap.exists()) {
            const promoCode = generatePromoCode();
            await setDoc(userRef, {
              email: user.email,
              points: 0,
              referrals: 0,
              withdrawals: 0,
              promoCode,
              createdAt: new Date().toISOString()
            });
            setCurrentUserData({
              email: user.email,
              points: 0,
              referrals: 0,
              withdrawals: 0,
              promoCode
            });
          } else {
            setCurrentUserData(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const promoCode = generatePromoCode();
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      points: 0,
      referrals: 0,
      withdrawals: 0,
      promoCode,
      createdAt: new Date().toISOString()
    });
  }

  async function logout() {
    await signOut(auth);
  }

  const value = {
    currentUser,
    currentUserData,
    login,
    register,
    logout,
    loading,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}