import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  handleDrawerToggle: () => void;
}

export default function Navbar({ handleDrawerToggle }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ width: { sm: `calc(100% - 240px)` }, ml: { sm: '240px' } }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          YogaLife Referral Dashboard
        </Typography>
        {currentUser && (
          <div>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar src={currentUser.photoURL || undefined} alt={currentUser.email || ''} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}