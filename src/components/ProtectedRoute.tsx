import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPoints?: number;
}

const ProtectedRoute = ({ children, requiredPoints = 0 }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasEnoughPoints, setHasEnoughPoints] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // Track mounted state
    
    const checkPoints = async () => {
      if (!currentUser?.uid) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (isMounted && docSnap.exists()) {
          const points = Number(docSnap.data().points) || 0;
          setHasEnoughPoints(points >= requiredPoints);
        }
      } catch (error) {
        console.error('Error checking points:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkPoints();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [currentUser, requiredPoints]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPoints > 0 && !hasEnoughPoints) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;