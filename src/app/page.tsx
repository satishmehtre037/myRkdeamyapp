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
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      if (email === 'admin@gmail.com' && password === 'admin') {
        localStorage.setItem('adminAuth', 'true');
        router.push('/dashboard');
      } else {
        setError('Invalid admin credentials. Access restricted.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-container">
      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="login-orb login-orb-1"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 25, -35, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="login-orb login-orb-2"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="login-card"
      >
        {/* Logo */}
        <div className="login-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ marginBottom: '16px' }}
          >
            <img src="https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png" alt="RKDeamy Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', margin: '0 auto' }} />
          </motion.div>
          <h1 className="login-title" style={{ display: 'none' }}>
            RKDeamy Classes
          </h1>
          <p className="login-subtitle">
            Admin Dashboard • Fee Management
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="input-group">
            <label className="input-label">
              Email Address
            </label>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-error"
              >
                {error}
              </motion.div>
            )}
            <div className="input-container">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="input-field"
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">
              Password
            </label>
            <div className="input-container">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="loading-spinner-sm"
              />
            ) : (
              'Sign In to Dashboard'
            )}
          </motion.button>
        </form>

        <p className="login-footer">
          Restricted Area — Admin Access Only
        </p>
      </motion.div>
    </div>
  );
}
