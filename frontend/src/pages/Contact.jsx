import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPhone, FaMapMarkerAlt, FaClock,
  FaInstagram, FaFacebook, FaTwitter,
  FaEnvelope, FaTiktok
} from 'react-icons/fa';
import { ArrowRight, Send } from 'lucide-react';
import api from '../services/api';

// ── Shared token injection (idempotent — safe to call on every page) ────────
if (typeof document !== 'undefined' && !document.getElementById('danis-fonts')) {
  const link = document.createElement('link');
  link.id  = 'danis-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
}
if (typeof document !== 'undefined' && !document.getElementById('danis-tokens')) {
  const s = document.createElement('style');
  s.id = 'danis-tokens';
  s.textContent = `
    :root {
      --dc-rose:      #c9867c;
      --dc-rose-deep: #a8635a;
      --dc-rose-pale: #f5e8e7;
      --dc-gold:      #b8955a;
      --dc-slate:     #1c1917;
      --dc-slate2:    #292524;
      --dc-slate3:    #44403c;
      --dc-cream:     #faf7f4;
      --dc-linen:     #f2ece6;
      --dc-ink:       #0d0b09;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body:    'DM Sans', system-ui, sans-serif;
      --font-mono:    'DM Mono', monospace;
    }
  `;
  document.head.appendChild(s);
}

// ── Motion variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

function Reveal({ children, delay = 0, style = {} }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-64px' });
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }} style={style}>
      {children}
    </motion.div>
  );
}

// ── Contact data ─────────────────────────────────────────────────────────────
const INFO = [
  { icon: <FaEnvelope size={16} />, label: 'Email',         value: 'aluochberyl16@gmail.com', href: 'mailto:aluochberyl16@gmail.com' },
  { icon: <FaPhone size={16} />,    label: 'Phone',         value: '+254 112 297 415',        href: 'tel:+254112297415' },
  { icon: <FaMapMarkerAlt size={16} />, label: 'Location',  value: 'Nairobi, Kenya',          href: null },
  { icon: <FaClock size={16} />,    label: 'Hours',         value: 'Mon–Sat · 8am–6pm',       href: null },
];

const SOCIALS = [
  { icon: <FaInstagram size={18} />, label: 'Instagram', href: 'https://www.instagram.com/danis_choice?igsh=MXp3Yzdnbjd4dGNs', color: '#E1306C' },
  { icon: <FaFacebook size={18} />,  label: 'Facebook',  href: 'https://facebook.com/YOUR_PAGE',  color: '#1877F2' },
  { icon: <FaTwitter size={18} />,   label: 'Twitter',   href: 'https://twitter.com/YOUR_USERNAME',color: '#1DA1F2' },
  { icon: <FaTiktok size={18} />,    label: 'TikTok',    href: 'https://www.tiktok.com/@danis.choice?_r=1&_t=ZS-97FrIxlhAmK', color: '#1c1917' },
];

// ── Input component — consistent with the atelier form aesthetic ─────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '2.5px',
        textTransform: 'uppercase', color: 'var(--dc-slate3)', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: '#ef4444', letterSpacing: '.5px' }}>
          {error}
        </span>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '13px 0',
  background: 'transparent',
  border: 'none',
  borderBottom: '1.5px solid rgba(28,25,23,0.18)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  fontSize: '.95rem',
  color: 'var(--dc-slate)',
  transition: 'border-color .2s',
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [form,   setForm]   = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const [focused, setFocused] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/public/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrMsg(err?.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--dc-cream)', minHeight: '100vh' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '56vh', minHeight: 420, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>

        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=85)',
          backgroundSize: 'cover', backgroundPosition: '50% 30%',
        }} />

        {/* Ink-wash overlay — lighter on right so image breathes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(13,11,9,0.80) 0%, rgba(13,11,9,0.50) 50%, rgba(13,11,9,0.25) 100%)',
        }} />

        {/* Film-grain — same signature as Home */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }} />

        {/* Rose accent strip — right edge, same as Home hero */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, background: 'var(--dc-rose)', zIndex: 5 }} />

        {/* Hero text */}
        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          style={{ position: 'relative', zIndex: 2, width: '100%',
            maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,7vw,120px)',
            paddingBottom: 'clamp(48px,6vw,80px)' }}>

          {/* Eyebrow */}
          <motion.div variants={fadeUp}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ width: 28, height: 1, background: 'var(--dc-rose)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', fontWeight: 500 }}>
              Get in Touch
            </span>
          </motion.div>

          {/* Split-colour headline — same Playfair italic treatment as Home */}
          <motion.h1 variants={fadeUp}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem,6vw,4.8rem)',
              fontWeight: 900, lineHeight: 1.0, letterSpacing: '-1px', color: 'white', margin: '0 0 18px' }}>
            Let's Talk<br />
            <em style={{ color: 'var(--dc-rose)', fontStyle: 'italic' }}>Fashion</em>
          </motion.h1>

          <motion.p variants={fadeUp}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(.9rem,1.4vw,1.05rem)',
              fontWeight: 300, color: 'rgba(255,255,255,0.68)', maxWidth: 440, lineHeight: 1.75 }}>
            Order questions, styling advice, or just a hello — our team responds within 24 hours.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ TAPE MARQUEE — connects hero to body, same as Home ═════════════ */}
      <div style={{ background: 'var(--dc-slate)', padding: '12px 0', overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex', width: 'max-content' }}>
          {[...Array(2)].flatMap(() =>
            ['Nairobi, Kenya', '·', 'Mon–Sat 8am–6pm', '·', '+254 112 297 415', '·', 'aluochberyl16@gmail.com', '·',
             'Fast Replies', '·', 'Style Advice', '·', 'Order Support', '·'].map((item, i) => (
              <span key={`${item}-${i}`}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '2.5px',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '0 24px',
                  borderRight: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
                {item}
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* ═══ MAIN BODY ══════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,7vw,96px) clamp(24px,4vw,48px)',
        display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'clamp(40px,6vw,96px)', alignItems: 'start' }}>

        {/* ── LEFT — Info + Socials ──────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>

          <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 14 }}>Contact Info</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)',
              fontWeight: 700, color: 'var(--dc-slate)', lineHeight: 1.15, margin: '0 0 16px' }}>
              We'd love to<br />
              <em style={{ color: 'var(--dc-rose)', fontStyle: 'italic' }}>hear from you</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--dc-slate3)',
              lineHeight: 1.8, maxWidth: 320 }}>
              Reach out through any of these channels and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Info items — clean list with thin rule dividers */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 48 }}>
            {INFO.map(({ icon, label, value, href }, i) => (
              <motion.div key={label} variants={fadeUp}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '18px 0', borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
                {/* Icon square — rose-pale bg, square corners matching the design language */}
                <div style={{ width: 38, height: 38, background: 'var(--dc-rose-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--dc-rose)', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', letterSpacing: '2px',
                    textTransform: 'uppercase', color: 'var(--dc-slate3)', marginBottom: 4 }}>
                    {label}
                  </div>
                  {href
                    ? <a href={href}
                        target={href.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '.9rem', fontWeight: 500,
                          color: 'var(--dc-slate)', textDecoration: 'none', transition: 'color .2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--dc-rose)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--dc-slate)'}>
                        {value}
                      </a>
                    : <div style={{ fontFamily: 'var(--font-body)', fontSize: '.9rem',
                        fontWeight: 500, color: 'var(--dc-slate)' }}>{value}</div>
                  }
                </div>
              </motion.div>
            ))}
          </div>

          {/* Socials — portrait cards with brand colour on hover */}
          <motion.div variants={fadeUp}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: 'var(--dc-slate3)', marginBottom: 14 }}>Follow Us</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SOCIALS.map(s => (
                <motion.a key={s.label} href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -3, borderColor: s.color }}
                  whileTap={{ scale: 0.96 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'white',
                    border: '1.5px solid rgba(28,25,23,0.1)', textDecoration: 'none',
                    transition: 'border-color .2s, box-shadow .2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <span style={{ color: s.color, display: 'flex', alignItems: 'center',
                    width: 32, height: 32, background: `${s.color}14`,
                    justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '.82rem',
                    fontWeight: 600, color: 'var(--dc-slate)' }}>{s.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT — Atelier enquiry form ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              /* ── Success state ── */
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ background: 'var(--dc-slate)', padding: 'clamp(40px,6vw,72px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 20 }}>
                {/* Animated checkmark */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, ease: [0.34, 1.56, 0.64, 1], duration: 0.5 }}
                  style={{ width: 64, height: 64, background: 'var(--dc-rose)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', color: 'white' }}>
                  ✓
                </motion.div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    fontStyle: 'italic', color: 'white', marginBottom: 10 }}>Message Sent</h3>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.6)',
                    fontSize: '.9rem', lineHeight: 1.75 }}>
                    Thank you for reaching out. Our team will reply within 24 hours.
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setStatus('idle')}
                  style={{ marginTop: 8, padding: '12px 28px', background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'var(--font-body)', fontSize: '.78rem', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'border-color .2s' }}>
                  Send Another
                </motion.button>
              </motion.div>

            ) : (
              /* ── Form ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Form header */}
                <div style={{ marginBottom: 40 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '3px',
                    textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 12 }}>
                    Enquiry Form
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                    fontWeight: 700, color: 'var(--dc-slate)', lineHeight: 1.15, margin: 0 }}>
                    Send a Message
                  </h2>
                  <div style={{ width: 40, height: 2, background: 'var(--dc-rose)', marginTop: 14 }} />
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* Row — Name + Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <Field label="Your Name *">
                      <input
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Jane Kamau"
                        required
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputStyle, borderBottomColor: focused === 'name' ? 'var(--dc-rose)' : 'rgba(28,25,23,0.18)' }}
                      />
                    </Field>
                    <Field label="Email Address *">
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="jane@email.com"
                        required
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputStyle, borderBottomColor: focused === 'email' ? 'var(--dc-rose)' : 'rgba(28,25,23,0.18)' }}
                      />
                    </Field>
                  </div>

                  <Field label="Subject">
                    <input
                      value={form.subject}
                      onChange={e => set('subject', e.target.value)}
                      placeholder="Order question, styling advice, feedback…"
                      onFocus={() => setFocused('subject')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, borderBottomColor: focused === 'subject' ? 'var(--dc-rose)' : 'rgba(28,25,23,0.18)' }}
                    />
                  </Field>

                  <Field label="Message *">
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Tell us how we can help…"
                      required
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inputStyle, resize: 'none', lineHeight: 1.7,
                        borderBottomColor: focused === 'message' ? 'var(--dc-rose)' : 'rgba(28,25,23,0.18)' }}
                    />
                  </Field>

                  {/* Error */}
                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: '#ef4444',
                          letterSpacing: '.5px', padding: '10px 14px', background: '#fee2e2',
                          borderLeft: '3px solid #ef4444' }}>
                        {errMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button type="submit" disabled={status === 'loading'}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 10,
                      padding: '15px 36px', background: status === 'loading' ? 'var(--dc-slate3)' : 'var(--dc-slate)',
                      color: 'white', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '.78rem', fontWeight: 600,
                      letterSpacing: '1.8px', textTransform: 'uppercase',
                      transition: 'background .2s', position: 'relative', overflow: 'hidden' }}>
                    {/* Rose underline that sweeps on hover */}
                    <motion.div
                      style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: 'var(--dc-rose)', width: '100%' }}
                      initial={{ scaleX: 0, originX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }} />
                    {status === 'loading'
                      ? 'Sending…'
                      : <><Send size={14} /> Send Message</>
                    }
                  </motion.button>

                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', letterSpacing: '1.5px',
                    color: 'var(--dc-slate3)', textTransform: 'uppercase' }}>
                    We reply within 24 hours · Mon–Sat · 8am–6pm
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ═══ MAP ════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative' }}>
        {/* Label bar above map */}
        <div style={{ background: 'var(--dc-slate)', padding: '14px clamp(24px,7vw,120px)',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaMapMarkerAlt size={13} color="var(--dc-rose)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '2.5px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            Nairobi, Kenya · Visit us in store
          </span>
        </div>
        <iframe
          title="Danis Choice Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19891433132!2d36.70730744863281!3d-1.3031933999999976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1718000000000!5m2!1sen!2ske"
          width="100%" height="360"
          style={{ border: 0, display: 'block', filter: 'grayscale(30%) contrast(1.05)' }}
          allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

    </div>
  );
}