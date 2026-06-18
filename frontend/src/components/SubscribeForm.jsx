
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; 

export default function SubscribeForm() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await api.post('/subscribers/subscribe', { email });
      setStatus('success');
      setMessage(res.data.message || 'Subscribed! Check your email.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        typeof err === 'string' ? err :
        err?.response?.data?.message || 'Something went wrong. Try again.'
      );
    }
  };

  return (
    <motion.form
      className="cta-email-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
    >
      <input
        type="email"
        placeholder="Enter your email address"
        className="cta-email-input"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
        disabled={status === 'loading' || status === 'success'}
        required
      />
      <motion.button
        type="submit"
        className="btn btn-outline-white btn-sm"
        disabled={status === 'loading' || status === 'success'}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {status === 'loading' ? 'Sending…' : status === 'success' ? '✓ Done!' : 'Subscribe'}
      </motion.button>

      {/* Feedback message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: '-32px',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '.82rem',
              color: status === 'success' ? '#10b981' : '#ef4444',
              fontWeight: 600,
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}