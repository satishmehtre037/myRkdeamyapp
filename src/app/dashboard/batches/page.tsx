'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from "@/lib/supabase";
import { Search, Plus, Edit, Trash2, Users, Calendar, IndianRupee } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import type { Batch } from '@/lib/mock-data';
import { getBatches, addBatch, updateBatch, deleteBatch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setBatches(await getBatches());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') as string,
      course_name: form.get('course_name') as string,
      start_date: form.get('start_date') as string,
      end_date: form.get('end_date') as string,
      total_fee: Number(form.get('total_fee')),
      status: form.get('status') as string,
    };
    try {
      if (editBatch) { await updateBatch(editBatch.id, payload); } else { await addBatch(payload); }
      setShowModal(false); setEditBatch(null); await loadData();
    } catch (err) { console.error(err); alert('Failed to save batch'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete batch "${name}"? Students in this batch will be unassigned.`)) return;
    try { await deleteBatch(id); await loadData(); } catch (err) { console.error(err); alert('Failed to delete batch. Make sure no students are assigned.'); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)', borderTop: '3px solid #6366f1', borderRadius: '50%' }} />
      </div>
    );
  }

  const statusColors: Record<string, string> = { active: '#10b981', upcoming: '#3b82f6', completed: '#64748b' };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>Batches</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{batches.length} batches total</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => { setEditBatch(null); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={16} /> Add Batch
        </motion.button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {batches.map((batch, i) => (
          <motion.div key={batch.id} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
              background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${statusColors[batch.status] || '#64748b'}, transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>{batch.name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{batch.course_name}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { setEditBatch(batch); setShowModal(true); }}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit size={14} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(batch.id, batch.name)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {[
                { icon: Users, label: `${batch.student_count} Students`, color: '#818cf8' },
                { icon: IndianRupee, label: formatCurrency(batch.total_fee), color: '#34d399' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <item.icon size={14} style={{ color: item.color }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                <Calendar size={12} /> {formatDate(batch.start_date)} — {formatDate(batch.end_date)}
              </div>
              <StatusBadge status={batch.status} size="sm" />
            </div>
          </motion.div>
        ))}
      </div>

      {batches.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No batches yet. Add your first batch!</div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditBatch(null); }} title={editBatch ? 'Edit Batch' : 'Add New Batch'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { name: 'name', label: 'Batch Name', type: 'text', val: editBatch?.name },
            { name: 'course_name', label: 'Course', type: 'text', val: editBatch?.course_name },
            { name: 'total_fee', label: 'Total Fee (₹)', type: 'number', val: editBatch?.total_fee },
            { name: 'start_date', label: 'Start Date', type: 'date', val: editBatch?.start_date },
            { name: 'end_date', label: 'End Date', type: 'date', val: editBatch?.end_date },
          ].map(field => (
            <div key={field.name}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>{field.label}</label>
              <input name={field.name} type={field.type} required defaultValue={field.val || ''}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Status</label>
            <select name="status" required defaultValue={editBatch?.status || 'upcoming'}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
            >
              <option value="active" style={{ background: '#1e293b' }}>Active</option>
              <option value="upcoming" style={{ background: '#1e293b' }}>Upcoming</option>
              <option value="completed" style={{ background: '#1e293b' }}>Completed</option>
            </select>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : editBatch ? 'Update Batch' : 'Add Batch'}
          </motion.button>
        </form>
      </Modal>
    </motion.div>
  );
}
