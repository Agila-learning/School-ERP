import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default Layout;
