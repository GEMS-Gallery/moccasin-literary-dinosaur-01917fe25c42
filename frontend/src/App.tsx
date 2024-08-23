import React from 'react';
import { useAuth } from './AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
