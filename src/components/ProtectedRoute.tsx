import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPoints?: number;
}

const ProtectedRoute = ({ children, requiredPoints = 0 }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasEnoughPoints, setHasEnoughPoints] = useState(false);

  useEffect(() => {
    const checkPoints = async () => {
      if (currentUser?.uid) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const points = Number(docSnap.data().points) || 0;
            setHasEnoughPoints(points >= requiredPoints);
          }
        } catch (error) {
          console.error('Error checking points:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkPoints();
  }, [currentUser, requiredPoints]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPoints > 0 && !hasEnoughPoints) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;