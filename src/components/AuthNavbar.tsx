import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AuthNavbar() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            YogaLife
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}