import React from 'react';
import { Outlet } from 'react-router-dom';
import { ParentProvider } from '../context/ParentContext';

const ParentLayout: React.FC = () => {
  return (
    <ParentProvider>
      <Outlet />
    </ParentProvider>
  );
};

export default ParentLayout;
