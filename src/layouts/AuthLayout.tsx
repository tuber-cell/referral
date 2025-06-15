// src/layouts/AuthLayout.tsx
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';

export default function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AuthNavbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}