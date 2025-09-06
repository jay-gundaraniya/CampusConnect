import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, storage } from '../services/api';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load role information from localStorage on mount
  useEffect(() => {
    const user = storage.getUser();
    if (user) {
      setCurrentRole(user.currentRole || user.role);
      setAvailableRoles(user.roles || []);
    }
  }, []);

  const switchRole = async (newRole) => {
    if (!availableRoles.includes(newRole)) {
      throw new Error('You do not have permission to switch to this role');
    }

    setIsLoading(true);
    try {
      const token = storage.getToken();
      const response = await api.switchRole(newRole, token);
      
      // Update state
      setCurrentRole(response.user.currentRole || response.user.role);
      setAvailableRoles(response.user.roles);
      
      return response;
    } catch (error) {
      console.error('Role switch failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = useCallback((userData) => {
    setCurrentRole(userData.currentRole || userData.role);
    setAvailableRoles(userData.roles || []);
  }, []);

  const clearRoleData = useCallback(() => {
    setCurrentRole(null);
    setAvailableRoles([]);
  }, []);

  const canSwitchRole = availableRoles.length > 1;

  const value = {
    currentRole,
    availableRoles,
    isLoading,
    switchRole,
    updateUserData,
    clearRoleData,
    canSwitchRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
