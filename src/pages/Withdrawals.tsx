import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserData {
  points: number;
  withdrawals: number;
}

const Withdrawals: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = React.useState<UserData>({
    points: 0,
    withdrawals: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              points: Number(data.points) || 0,
              withdrawals: Number(data.withdrawals) || 0,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleWithdraw = () => {
    // Implement your withdrawal logic here
    alert('Withdrawal functionality will be implemented here');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Withdraw Earnings
      </Typography>
      
      {userData.points >= 10000 ? (
        <>
          <Typography variant="body1" gutterBottom>
            You have {userData.points.toLocaleString()} points available for withdrawal.
          </Typography>
          <Typography variant="body1" gutterBottom>
            Each withdrawal converts 10,000 points to ₹10,000.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleWithdraw}
            sx={{ mt: 2 }}
          >
            Withdraw ₹10,000
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>
            You currently have {userData.points.toLocaleString()} points.
          </Typography>
          <Typography variant="body1" gutterBottom>
            You need {10000 - userData.points} more points to make a withdrawal.
          </Typography>
          <Typography variant="body1">
            Each withdrawal converts 10,000 points to ₹10,000.
          </Typography>
        </>
      )}
      
      <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
        Total withdrawals made: {userData.withdrawals}
      </Typography>
    </Box>
  );
};

export default Withdrawals;