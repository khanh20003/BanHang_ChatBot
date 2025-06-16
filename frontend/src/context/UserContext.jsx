import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [customerId, setCustomerIdState] = useState(null);

  // Helper to update both state and localStorage
  const setCustomerId = useCallback((id) => {
    if (id === null || id === undefined) {
      localStorage.removeItem('customerId');
      setCustomerIdState(null);
    } else {
      localStorage.setItem('customerId', id.toString());
      setCustomerIdState(parseInt(id, 10));
    }
  }, []);

  // On mount, initialize from localStorage
  useEffect(() => {
    let id = localStorage.getItem('customerId');
    if (!id) {
      id = Math.floor(Math.random() * 1000000).toString();
      localStorage.setItem('customerId', id);
    }
    setCustomerIdState(parseInt(id, 10));
  }, []);

  // Listen for localStorage changes (e.g., in other tabs)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'customerId') {
        if (e.newValue) {
          setCustomerIdState(parseInt(e.newValue, 10));
        } else {
          setCustomerIdState(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <UserContext.Provider value={{ customerId, setCustomerId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};