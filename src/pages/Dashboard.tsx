import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { CopyAll as CopyIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface UserData {
  points: number;
  referrals: number;
  withdrawals: number;
  promoCode?: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, currentUserData, refreshUserData } = useAuth();
  const [userData, setUserData] = React.useState<UserData>({
    points: 0,
    referrals: 0,
    withdrawals: 0,
  });
  const [copied, setCopied] = React.useState(false);

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
              referrals: Number(data.referrals) || 0,
              withdrawals: Number(data.withdrawals) || 0,
              promoCode: data.promoCode
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [currentUser, currentUserData]);

  const copyToClipboard = () => {
    if (userData.promoCode) {
      navigator.clipboard.writeText(userData.promoCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const progress = (userData.points / 50000) * 100; // Updated to 50,000 points
  const pointsNeeded = Math.max(0, 50000 - userData.points); // Updated to 50,000 points

  const chartData = {
    labels: ['Points Earned', 'Points Remaining'],
    datasets: [
      {
        data: [userData.points, pointsNeeded],
        backgroundColor: ['#4a148c', '#e0e0e0'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 3
      }}>
        <Box sx={{ 
          flex: '1 1 300px',
          minWidth: '300px',
          maxWidth: '100%'
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Your Points
              </Typography>
              <Typography variant="h4" component="div">
                {userData.points.toLocaleString()}
              </Typography>
              <Typography variant="body2" component="p">
                {pointsNeeded.toLocaleString()} points needed to withdraw
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 300px',
          minWidth: '300px',
          maxWidth: '100%'
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Referrals
              </Typography>
              <Typography variant="h4" component="div">
                {userData.referrals.toLocaleString()}
              </Typography>
              <Typography variant="body2" component="p">
                Each referral earns you 2 points
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 300px',
          minWidth: '300px',
          maxWidth: '100%'
        }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Withdrawals
              </Typography>
              <Typography variant="h4" component="div">
                {userData.withdrawals.toLocaleString()}
              </Typography>
              <Typography variant="body2" component="p">
                ₹50,000 per withdrawal
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 3
      }}>
        <Box sx={{ 
          flex: '1 1 400px',
          minWidth: '300px'
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom component="h2">
                Your Promo Code
              </Typography>
              <TextField
                fullWidth
                value={userData.promoCode || 'Loading...'}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={copyToClipboard}
                        disabled={!userData.promoCode}
                        aria-label="Copy promo code"
                        edge="end"
                      >
                        <CopyIcon color={copied ? 'success' : 'inherit'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
              />
              <Typography variant="body2" sx={{ mt: 1 }} component="p">
                Share this code with friends. When they subscribe using it, you'll get 2 points.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ 
          flex: '1 1 400px',
          minWidth: '300px'
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom component="h2">
                Progress to Withdrawal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    color={progress >= 100 ? 'success' : 'primary'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {`${Math.round(progress)}%`}
                  </Typography>
                </Box>
              </Box>
              {userData.points >= 50000 ? ( // Updated to 50,000 points
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  onClick={() => alert('Withdrawal functionality to be implemented')}
                  sx={{ py: 1.5 }}
                >
                  Withdraw ₹50,000
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  disabled 
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Need {pointsNeeded.toLocaleString()} more points
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom component="h2">
              Points Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          return `${context.label}: ${context.raw?.toLocaleString()} points`;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;