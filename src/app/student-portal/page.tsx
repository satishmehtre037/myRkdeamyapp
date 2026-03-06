'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Mail, Phone, GraduationCap, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find student by email and phone
      const { data, error: dbError } = await supabase
        .from('students')
        .select('id, status')
        .eq('email', email.trim())
        .eq('phone', phone.trim())
        .single();

      if (dbError || !data) {
        throw new Error('Invalid email or phone number. Please try again.');
      }

      if (data.status !== 'active') {
        throw new Error('Your account is not active. Please contact administration.');
      }

      // Store student_id in localStorage for simple auth
      localStorage.setItem('student_id', data.id);
      
      // Redirect to student dashboard
      router.push('/student-portal/dashboard');
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated geometric background elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          border: '1px solid rgba(56, 189, 248, 0.05)',
          borderRadius: '30%',
          top: '-20%',
          right: '-10%',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          border: '1px solid rgba(167, 139, 250, 0.05)',
          borderRadius: '40%',
          bottom: '-20%',
          left: '-10%',
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '24px',
          padding: '48px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.1)',
          position: 'relative',
          zIndex: 1,
          margin: '20px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              marginBottom: '16px',
            }}
          >
            <img src="https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png" alt="RKDeamy Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
          </motion.div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', display: 'none' }}>
            Student Portal
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Welcome back! Please sign in to view your details.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#fca5a5',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Registered Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              padding: '0 14px',
              transition: 'all 0.3s',
            }}>
              <Mail size={18} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#f8fafc',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Phone (Password) */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Phone Number <span style={{ color: '#64748b', fontWeight: 400 }}>(Your PIN)</span>
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              padding: '0 14px',
            }}>
              <Phone size={18} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#f8fafc',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              Use your registered 10-digit phone number as your password.
            </p>
          </div>

          {/* Sign In Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
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
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.25)',
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
              'Sign In'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
