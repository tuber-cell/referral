import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface Referral {
  id: string;
  email: string;
  date: string;
  status: 'pending' | 'completed';
  points: number;
  subscriptionId?: string;
}

const Referrals: React.FC = () => {
  const { currentUser } = useAuth();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPoints, setTotalPoints] = React.useState(0);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const fetchReferrals = async () => {
    if (currentUser?.uid) {
      try {
        const referralsRef = collection(db, 'users', currentUser.uid, 'referrals');
        const querySnapshot = await getDocs(referralsRef);
        
        const referralsData: Referral[] = [];
        let total = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          referralsData.push({
            id: doc.id,
            email: data.email,
            date: new Date(data.date?.toDate() || data.date).toLocaleDateString(),
            status: data.status,
            points: data.points || 0,
            subscriptionId: data.subscriptionId
          });
          total += data.points || 0;
        });
        
        referralsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setReferrals(referralsData);
        setTotalPoints(total);
      } catch (error) {
        console.error('Error fetching referrals:', error);
        showSnackbar('Failed to load referrals', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const referralsRef = collection(db, 'users', currentUser.uid, 'referrals');
    const unsubscribe = onSnapshot(referralsRef, (snapshot) => {
      const referralsData: Referral[] = [];
      let total = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        referralsData.push({
          id: doc.id,
          email: data.email,
          date: new Date(data.date?.toDate() || data.date).toLocaleDateString(),
          status: data.status,
          points: data.points || 0,
          subscriptionId: data.subscriptionId
        });
        total += data.points || 0;
      });
      
      referralsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReferrals(referralsData);
      setTotalPoints(total);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to referrals:', error);
      showSnackbar('Failed to load referrals', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const copyReferralCode = () => {
    if (currentUser?.uid) {
      const getUserPromoCode = async () => {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const promoCode = userSnap.data().promoCode;
            if (promoCode) {
              navigator.clipboard.writeText(promoCode);
              showSnackbar('Promo code copied to clipboard!', 'success');
            } else {
              showSnackbar('No promo code found', 'error');
            }
          }
        } catch (error) {
          console.error('Error getting promo code:', error);
          showSnackbar('Failed to copy promo code', 'error');
        }
      };
      
      getUserPromoCode();
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Referrals
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReferrals}
        >
          Refresh
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Total Referrals: {referrals.length}
          </Typography>
          <Typography variant="body1">
            Points Earned: {totalPoints}/50000
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={copyReferralCode}
        >
          Copy Promo Code
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Subscription</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {referral.email.charAt(0).toUpperCase()}
                      </Avatar>
                      {referral.email}
                    </Box>
                  </TableCell>
                  <TableCell>{referral.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={referral.status} 
                      color={referral.status === 'completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{referral.points}</TableCell>
                  <TableCell>
                    {referral.subscriptionId ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="None" color="default" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No referrals yet. Share your promo code to earn points!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Referrals;