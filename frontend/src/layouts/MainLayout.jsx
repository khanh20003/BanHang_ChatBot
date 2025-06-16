import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { UserProvider, useUser } from '../context/UserContext';

const MainLayoutContent = () => {
  const { customerId } = useUser();
  
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <Chatbot customerId={customerId} />
    </>
  );
};

const MainLayout = () => {
  return (
    <UserProvider>
      <MainLayoutContent />
    </UserProvider>
  );
};

export default MainLayout; 