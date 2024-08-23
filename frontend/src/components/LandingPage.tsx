import React from 'react';
import { useAuth } from '../AuthContext';
import { Container, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/system';

const HeroSection = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
}));

const LandingPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <HeroSection>
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to IC Box
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Secure, decentralized file storage on the Internet Computer
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={login} sx={{ mt: 4 }}>
          Login with Internet Identity
        </Button>
      </Container>
    </HeroSection>
  );
};

export default LandingPage;
