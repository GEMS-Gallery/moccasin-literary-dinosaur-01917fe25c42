import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          IC Box
        </Typography>
        {isAuthenticated && (
          <Box>
            <Button color="inherit" href="https://github.com/GEMS-Gallery/moccasin-literary-dinosaur-01917fe25c42" target="_blank">
              Show Code
            </Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
