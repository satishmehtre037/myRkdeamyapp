'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Download } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import type { Student, Batch } from '@/lib/mock-data';
import { getStudents, getBatches, addStudent, updateStudent, deleteStudent } from '@/lib/api';
import { formatCurrency, getInitials } from '@/lib/utils';
import Link from 'next/link';
import { downloadCSV } from '@/utils/export';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [s, b] = await Promise.all([getStudents(), getBatches()]);
      setStudents(s);
      setBatches(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchBatch = filterBatch === 'all' || s.batch_id === filterBatch;
    const matchStatus = filterStatus === 'all' || s.payment_status === filterStatus;
    return matchSearch && matchBatch && matchStatus;
  });

  const handleExport = () => {
    downloadCSV(filtered, 'students_export.csv', [
      { header: 'Student Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Batch', key: 'batch_name' },
      { header: 'Total Fee', key: 'total_fee' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
      { header: 'Status', key: 'payment_status' },
      { header: 'Joined Date', key: 'joined_at' }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, {
          name: form.get('name') as string,
          email: form.get('email') as string,
          phone: form.get('phone') as string,
          batch_id: form.get('batch_id') as string,
        });
      } else {
        await addStudent({
          name: form.get('name') as string,
          email: form.get('email') as string,
          phone: form.get('phone') as string,
          batch_id: form.get('batch_id') as string,
        });
      }
      setShowModal(false);
      setEditStudent(null);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This will also delete their fee records.`)) return;
    try {
      await deleteStudent(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)', borderTop: '3px solid #6366f1', borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>Students</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{students.length} total students enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Download size={16} /> Export CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setEditStudent(null); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={16} /> Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(99, 102, 241, 0.08)', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ color: '#64748b' }} />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit' }}
          />
        </div>
        <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
          style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>{b.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All Status</option>
          <option value="paid" style={{ background: '#1e293b' }}>Paid</option>
          <option value="partial" style={{ background: '#1e293b' }}>Partial</option>
          <option value="due" style={{ background: '#1e293b' }}>Due</option>
        </select>
      </motion.div>

      {/* Table / Mobile Cards */}
      <motion.div variants={itemVariants} className="glass-3d responsive-table-container">
        {/* Desktop Header */}
        <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 80px', padding: '14px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          <span>Student</span><span>Batch</span><span>Total Fee</span><span>Paid</span><span>Status</span><span>Actions</span>
        </div>
        
        <div className="table-body">
          {filtered.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="table-row"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr 80px', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(99, 102, 241, 0.04)', transition: 'background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(30, 41, 59, 0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <Link href={`/dashboard/students/${student.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#818cf8', flexShrink: 0 }}>
                  {getInitials(student.name)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.email}</div>
                </div>
              </Link>
              
              <div className="mobile-cell">
                <span className="mobile-label">Batch:</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{student.batch_name}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Total Fee:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{formatCurrency(student.total_fee)}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Paid:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>{formatCurrency(student.paid_amount)}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Status:</span>
                <StatusBadge status={student.payment_status} size="sm" />
              </div>
              
              <div className="mobile-actions" style={{ display: 'flex', gap: '6px' }}>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setEditStudent(student); setShowModal(true); }}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit size={14} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(student.id, student.name)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No students found.</div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Student Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditStudent(null); }} title={editStudent ? 'Edit Student' : 'Add New Student'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {['name', 'email', 'phone'].map(field => (
            <div key={field}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px', textTransform: 'capitalize' }}>{field}</label>
              <input name={field} type={field === 'email' ? 'email' : 'text'} required defaultValue={editStudent?.[field as keyof Student] as string || ''}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Batch</label>
            <select name="batch_id" required defaultValue={editStudent?.batch_id || ''}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
            >
              <option value="" style={{ background: '#1e293b' }}>Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>{b.name}</option>)}
            </select>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : editStudent ? 'Update Student' : 'Add Student'}
          </motion.button>
        </form>
      </Modal>
    </motion.div>
  );
}
