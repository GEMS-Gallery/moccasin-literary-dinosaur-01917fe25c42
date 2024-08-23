import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Tooltip, IconButton } from '@mui/material';
import { GitHub as GitHubIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';

const Header: React.FC = () => {
  const { isAuthenticated, logout, principal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopyPrincipal = () => {
    if (principal) {
      navigator.clipboard.writeText(principal.toString());
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          IC Box
        </Typography>
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Copy your public ID">
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, cursor: 'pointer' }} onClick={handleCopyPrincipal}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {principal ? Principal.fromText(principal.toString()).toText() : ''}
                </Typography>
                <IconButton color="inherit" size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Tooltip>
            <Button
              color="inherit"
              href="https://github.com/GEMS-Gallery/moccasin-literary-dinosaur-01917fe25c42"
              target="_blank"
              startIcon={<GitHubIcon />}
            >
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
