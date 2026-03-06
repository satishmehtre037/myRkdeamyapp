'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  X,
} from 'lucide-react';
import { useSidebar } from '@/app/dashboard/layout';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/batches', label: 'Batches', icon: GraduationCap },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/fees', label: 'Fee Management', icon: Wallet },
];

const bottomNavItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen, isCollapsed, setCollapsed } = useSidebar();

  const sidebarWidth = isCollapsed ? 72 : 260;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="sidebar-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 49,
              display: 'none', // hidden by default, CSS media query shows it
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: isCollapsed ? '20px 12px' : '20px 20px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '72px',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              color: 'white',
              flexShrink: 0,
            }}>
              RK
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                    RKDeamy
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    Fee Management
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'none', // shown via CSS on mobile
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', padding: '8px 12px', display: isCollapsed ? 'none' : 'block' }}>
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isCollapsed ? '10px 0' : '10px 12px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    position: 'relative',
                    color: isActive ? '#e2e8f0' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))' : 'transparent',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(99, 102, 241, 0.08)';
                      (e.currentTarget as HTMLDivElement).style.color = '#c7d2fe';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      (e.currentTarget as HTMLDivElement).style.color = '#94a3b8';
                    }
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '20px',
                        borderRadius: '0 4px 4px 0',
                        background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(99, 102, 241, 0.08)' }}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  transition: 'background 0.2s, color 0.2s',
                }}>
                  <Icon size={20} />
                  {!isCollapsed && <span style={{ fontSize: '14px' }}>{item.label}</span>}
                </div>
              </Link>
            );
          })}

          {/* Collapse toggle — hidden on mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!isCollapsed)}
            className="collapse-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isCollapsed ? '10px 0' : '10px 12px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
              width: '100%',
              border: 'none',
              background: 'none',
              fontFamily: 'inherit',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!isCollapsed && <span>Collapse</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
