'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo mode: just navigate
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 30%, #1a1040 60%, #0a0e1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
          top: '-100px',
          right: '-100px',
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 25, -35, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 70%)',
          bottom: '-80px',
          left: '-80px',
          filter: 'blur(60px)',
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          borderRadius: '24px',
          padding: '48px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(99, 102, 241, 0.06)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
            }}
          >
            <GraduationCap size={32} color="white" />
          </motion.div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0', marginBottom: '6px' }}>
            RKDeamy Classes
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Admin Dashboard • Fee Management
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: '12px',
              padding: '0 14px',
              transition: 'border-color 0.3s',
            }}>
              <Mail size={18} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rkdeamy.com"
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: '12px',
              padding: '0 14px',
            }}>
              <Lock size={18} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                }}
              />
            ) : (
              'Sign In to Dashboard'
            )}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#475569' }}>
          Demo Mode — Click Sign In to explore
        </p>
      </motion.div>
    </div>
  );
}
