import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [name, setName] = React.useState(currentUser?.displayName || '');
  const [email, setEmail] = React.useState(currentUser?.email || '');
  const [notifications, setNotifications] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name,
        emailNotifications: notifications
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80,
            bgcolor: 'primary.main',
            fontSize: '2rem'
          }}
        >
          {currentUser?.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Button variant="outlined">Change Photo</Button>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      
      <Box sx={{ maxWidth: 600, mb: 4 }}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          type="email"
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      
      <FormControlLabel
        control={
          <Switch 
            checked={notifications} 
            onChange={(e) => setNotifications(e.target.checked)}
          />
        }
        label="Email Notifications"
        sx={{ mb: 2 }}
      />
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;