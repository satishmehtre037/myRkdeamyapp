'use client';

import React from 'react';
import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/app/dashboard/layout';

export default function TopBar() {
  const { setMobileOpen } = useSidebar();

  return (
    <header style={{
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'rgba(17, 24, 39, 0.6)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '16px',
    }}
    className="topbar"
    >
      {/* Mobile menu button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(true)}
        className="mobile-menu-btn"
        style={{
          display: 'none', // shown via CSS on mobile
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(99, 102, 241, 0.08)',
          borderRadius: '10px',
          padding: '10px',
          cursor: 'pointer',
          color: '#94a3b8',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Menu size={20} />
      </motion.button>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        padding: '10px 16px',
        flex: 1,
        maxWidth: '360px',
        border: '1px solid rgba(99, 102, 241, 0.08)',
        transition: 'border-color 0.3s',
      }}
      className="topbar-search"
      >
        <Search size={18} style={{ color: '#64748b', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search students, batches, payments..."
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#e2e8f0',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />
        <kbd className="search-shortcut" style={{
          fontSize: '11px',
          color: '#475569',
          background: 'rgba(30, 41, 59, 0.8)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
        }}>⌘K</kbd>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'relative',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(99, 102, 241, 0.08)',
            borderRadius: '10px',
            padding: '10px',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            border: '2px solid #111827',
          }} />
        </motion.button>

        {/* Divider */}
        <div className="topbar-divider" style={{ width: '1px', height: '32px', background: 'rgba(99, 102, 241, 0.1)' }} />

        {/* Profile */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="topbar-profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '10px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(30, 41, 59, 0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            color: 'white',
            flexShrink: 0,
          }}>
            A
          </div>
          <div className="profile-info">
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Admin</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>admin@rkdeamy.com</div>
          </div>
          <ChevronDown size={14} style={{ color: '#64748b' }} className="profile-chevron" />
        </motion.div>
      </div>
    </header>
  );
}
