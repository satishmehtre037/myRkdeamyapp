'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

interface SidebarContextType {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isMobileOpen: false,
  setMobileOpen: () => {},
  isCollapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
  }>({
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    // Check for the specific admin token instead of a generic isLoggedIn
    const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';
    
    // Clear old generic tokens if they exist strictly for security
    localStorage.removeItem('isLoggedIn');

    // Defer the state update to the next tick to avoid synchronous cascading renders
    const timeoutId = setTimeout(() => {
      setAuthState({ isLoading: false, isAuthenticated: isAdminLoggedIn });
      
      if (!isAdminLoggedIn) {
        router.push('/');
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [router]);

  if (authState.isLoading || !authState.isAuthenticated) {
    return (
      <div className="loading-container">
        <div 
          className="spin"
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.15)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
          }} 
        />
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen, isCollapsed, setCollapsed }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
        <Sidebar />
        <div
          className="dashboard-main"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <TopBar />
          <main style={{
            flex: 1,
            overflowY: 'auto',
          }}
          className="dashboard-content"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
