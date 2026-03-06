'use client';

import React, { useState, createContext, useContext } from 'react';
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

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen, isCollapsed, setCollapsed }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
        <Sidebar />
        <div
          className="dashboard-main"
          style={{
            flex: 1,
            marginLeft: '260px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <TopBar />
          <main style={{
            flex: 1,
            padding: '28px 32px',
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
