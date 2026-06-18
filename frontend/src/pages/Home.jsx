import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Truck, RefreshCcw, ShieldCheck, MessageCircle,
  ArrowRight, ArrowLeft, Play, Pause, ChevronRight,
  Star, Package, Sparkles, Quote
} from 'lucide-react';
import { productService } from '../services/api';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';

// ── Google Fonts injected once ──────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('danis-fonts')) {
  const link = document.createElement('link');
  link.id = 'danis-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
}

// ── CSS token injection ─────────────────────────────────────────────────────
const TOKENS = `
  :root {
    --dc-rose:       #c9867c;
    --dc-rose-deep:  #a8635a;
    --dc-rose-pale:  #f5e8e7;
    --dc-gold:       #b8955a;
    --dc-gold-pale:  #f5ede0;
    --dc-slate:      #1c1917;
    --dc-slate2:     #292524;
    --dc-slate3:     #44403c;
    --dc-cream:      #faf7f4;
    --dc-linen:      #f2ece6;
    --dc-ink:        #0d0b09;
    --dc-mist:       rgba(28,25,23,0.06);
    --font-display:  'Playfair Display', Georgia, serif;
    --font-body:     'DM Sans', system-ui, sans-serif;
    --font-mono:     'DM Mono', monospace;
    --ease-silk:     cubic-bezier(0.25, 0.1, 0.25, 1);
    --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('danis-tokens')) {
  const s = document.createElement('style');
  s.id = 'danis-tokens';
  s.textContent = TOKENS;
  document.head.appendChild(s);
}

// ── Motion variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeLeft = {
  hidden:  { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeRight = {
  hidden:  { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] } },
};
const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};
const staggerItem = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
};
const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,   transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
};

// ── Scroll-reveal wrapper ───────────────────────────────────────────────────
function Reveal({ children, variants = fadeUp, delay = 0, className = '', style = {} }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-72px' });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ── Subscribe form ──────────────────────────────────────────────────────────
function SubscribeForm() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');
  const [msg,    setMsg]    = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.post('/subscribers/subscribe', { email });
      setStatus('success');
      setMsg(res.data.message || "You're in! Welcome to the Danis circle.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMsg(err?.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <form className="subscribe-row" onSubmit={submit}>
        <input type="email" className="subscribe-input" placeholder="your@email.com"
          value={email} onChange={e => { setEmail(e.target.value); setStatus('idle'); setMsg(''); }}
          disabled={status === 'loading' || status === 'success'} required />
        <motion.button type="submit" className="subscribe-btn"
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          {status === 'loading' ? '…' : status === 'success' ? '✓' : 'Join'}
        </motion.button>
      </form>
      <AnimatePresence>
        {msg && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 10, fontSize: '.78rem', fontWeight: 500, letterSpacing: '.3px',
              color: status === 'success' ? '#10b981' : '#ef4444', textAlign: 'center' }}>
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image:  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90',
    season: 'SS 2025',
    line1:  'The Art of',
    line2:  'Feminine Style',
    sub:    'Curated collections that celebrate the modern Kenyan woman',
    cta:    'Shop Collection',
    link:   '/shop',
    pos:    '60% 20%',
    accent: '#c9867c',
    num:    '01',
  },
  {
    image:  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=90',
    season: 'Footwear Edit',
    line1:  'Step Into',
    line2:  'Confidence',
    sub:    'From strappy heels to casual sneakers — every step elevated',
    cta:    'Shop Shoes',
    link:   '/shop?category=shoes',
    pos:    '50% 30%',
    accent: '#b8955a',
    num:    '02',
  },
  {
    image:  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&q=90',
    season: 'Bag Collection',
    line1:  'Carry Your',
    line2:  'World in Style',
    sub:    'Luxury bags for every occasion — boardroom to brunch',
    cta:    'Shop Bags',
    link:   '/shop?category=bags',
    pos:    '50% 40%',
    accent: '#7c9ab5',
    num:    '03',
  },
];

const CATEGORIES = [
  { name: 'Clothes',  slug: 'clothes', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b2efe?w=700&q=85', count: '120+ pieces', desc: 'Dresses, tops & more' },
  { name: 'Shoes',    slug: 'shoes',   image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=85', count: '80+ styles',  desc: 'Heels, flats & sneakers' },
  { name: 'Bags',     slug: 'bags',    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=85', count: '60+ designs', desc: 'Handbags & clutches' },
];

const TAPE = ['Free Returns', 'New Arrivals Weekly', 'Authentic Products', 'Secure Payments', "Kenya's Fashion Hub", 'Premium Quality'];

const WHY = [
  { icon: <Truck size={22} strokeWidth={1.4} />,        title: 'Fast Delivery',   desc: 'Nairobi CBD same day. Nationwide 1–3 days.' },
  { icon: <RefreshCcw size={22} strokeWidth={1.4} />,   title: 'Easy Returns',    desc: '30-day hassle-free returns, no questions asked.' },
  { icon: <ShieldCheck size={22} strokeWidth={1.4} />,  title: 'Secure Payment',  desc: 'Bank-grade encryption on every transaction.' },
  { icon: <MessageCircle size={22} strokeWidth={1.4} />,title: 'Style Advice',    desc: 'Personal fashion experts — 7 days a week.' },
];

const STATS = [
  { value: '50K+', label: 'Customers' },
  { value: '2,000+', label: 'Products' },
  { value: '4.9★', label: 'Rating' },
  { value: '5 Yrs', label: 'Trusted' },
];

const TESTIMONIALS = [
  { name: 'Amina K.', quote: 'Danis Choice changed how I dress. Every piece feels made for me.', location: 'Nairobi' },
  { name: 'Grace M.', quote: 'The quality is unmatched at this price. I won\'t shop anywhere else.', location: 'Mombasa' },
  { name: 'Wanjiru N.', quote: 'Fast delivery, beautiful packaging. They really care about the experience.', location: 'Kisumu' },
];

// ── Stat counter ────────────────────────────────────────────────────────────
function Stat({ value, label, delay }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      style={{ textAlign: 'center', padding: '0 24px' }}>
      <motion.div initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.55, delay: delay + 0.12, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--dc-rose)', lineHeight: 1 }}>
        {value}
      </motion.div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '.7rem', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--dc-slate3)', marginTop: 6 }}>
        {label}
      </div>
    </motion.div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [slide,    setSlide]   = useState(0);
  const [playing,  setPlaying] = useState(true);
  const [featured, setFeatured]= useState([]);
  const timerRef = useRef(null);
  const heroRef  = useRef(null);

  const { scrollY } = useScroll();
  const heroY   = useTransform(scrollY, [0, 700], [0, 130]);
  const heroOpa = useTransform(scrollY, [0, 380], [1, 0]);

  const goTo = idx => { if (idx !== slide) setSlide(idx); };
  const next = () => goTo((slide + 1) % SLIDES.length);
  const prev = () => goTo((slide - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (playing) timerRef.current = setInterval(next, 6500);
    return () => clearInterval(timerRef.current);
  }, [playing, slide]);

  useEffect(() => {
    productService.getAll({ featured: true, per_page: 8 }).then(r => setFeatured(r.data.data)).catch(() => {});
  }, []);

  const s = SLIDES[slide];

  return (
    <div className="home" style={{ fontFamily: 'var(--font-body)', background: 'var(--dc-cream)' }}>

      {/* ═══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef} style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden' }}>

        {/* Slide BG */}
        <AnimatePresence mode="sync">
          <motion.div key={slide}
            style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: s.pos, zIndex: 0 }}
            initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 1.15, ease: 'easeInOut' }} />
        </AnimatePresence>

        {/* Layered overlay — dark left, clear right */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(105deg, rgba(13,11,9,0.82) 0%, rgba(13,11,9,0.55) 45%, rgba(13,11,9,0.15) 75%, transparent 100%)' }} />

        {/* Film-grain texture — the signature element */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '180px 180px' }} />

        {/* Accent side strip */}
        <motion.div layoutId="accent-strip" key={`strip-${slide}`}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, background: s.accent, zIndex: 10 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }} />

        {/* Slide number — top right */}
        <AnimatePresence mode="wait">
          <motion.div key={`num-${slide}`}
            style={{ position: 'absolute', top: 32, right: 28, zIndex: 10, fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            {s.num} / 0{SLIDES.length}
          </motion.div>
        </AnimatePresence>

        {/* Hero content — parallax */}
        <motion.div style={{ y: heroY, opacity: heroOpa, position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', paddingLeft: 'clamp(24px,7vw,120px)', paddingBottom: 120 }}>
          <AnimatePresence mode="wait">
            <motion.div key={slide}
              initial={{ opacity: 0, y: 52, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -28, filter: 'blur(4px)' }}
              transition={{ duration: 0.78, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ maxWidth: 600 }}>

              {/* Season tag */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ width: 32, height: 1, background: s.accent }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: s.accent, fontWeight: 500 }}>{s.season}</span>
              </motion.div>

              {/* Headline — split colour on italic word */}
              <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.72, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-1px', margin: 0, color: 'white' }}>
                {s.line1}<br />
                <em style={{ color: s.accent, fontStyle: 'italic' }}>{s.line2}</em>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38, duration: 0.6 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(.95rem,1.5vw,1.1rem)', fontWeight: 300, color: 'rgba(255,255,255,0.72)', marginTop: 20, marginBottom: 36, lineHeight: 1.75, maxWidth: 420 }}>
                {s.sub}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Link to={s.link}>
                  <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px',
                      border: `1.5px solid ${s.accent}`, color: 'white', fontFamily: 'var(--font-body)',
                      fontSize: '.82rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                      borderRadius: 0, background: 'transparent', cursor: 'pointer',
                      backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    {s.cta}
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}>
                      <ArrowRight size={16} />
                    </motion.span>
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide thumbnails strip — bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', background: 'rgba(13,11,9,0.55)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {SLIDES.map((sl, i) => (
            <motion.button key={i} onClick={() => goTo(i)} whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px',
                border: 'none', background: i === slide ? 'rgba(255,255,255,0.1)' : 'transparent',
                cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 44, height: 34, borderRadius: 3, backgroundImage: `url(${sl.image})`,
                backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0,
                opacity: i === slide ? 1 : 0.55, transition: 'opacity .3s' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: i === slide ? sl.accent : 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{sl.season}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.82rem', fontStyle: 'italic',
                  color: i === slide ? 'white' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{sl.line2}</div>
              </div>
              {i === slide && (
                <motion.div layoutId="thumb-bar"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.accent }}
                  transition={{ duration: 0.4 }} />
              )}
            </motion.button>
          ))}
        </div>

        {/* Playback controls */}
        <div style={{ position: 'absolute', left: 'clamp(24px,7vw,120px)', bottom: 80, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
            <ArrowLeft size={15} />
          </motion.button>
          {SLIDES.map((_, i) => (
            <motion.button key={i} onClick={() => goTo(i)}
              animate={{ width: i === slide ? 22 : 7, background: i === slide ? s.accent : 'rgba(255,255,255,0.35)' }}
              style={{ height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0 }}
              transition={{ duration: 0.32 }} />
          ))}
          <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
            <ArrowRight size={15} />
          </motion.button>
          <motion.button onClick={() => setPlaying(!playing)} whileHover={{ scale: 1.1 }}
            style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
            <AnimatePresence mode="wait">
              <motion.span key={playing ? 'p' : 'r'} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                {playing ? <Pause size={13} /> : <Play size={13} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </section>

      {/* ═══ TAPE MARQUEE ════════════════════════════════════════════════════ */}
      <div style={{ background: 'var(--dc-slate)', padding: '13px 0', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex', width: 'max-content', gap: 0 }}>
          {[...TAPE, ...TAPE].map((item, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', padding: '0 28px',
              borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ STATS ════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--dc-linen)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '52px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0,
            borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
            {STATS.map((st, i) => (
              <div key={st.label} style={{ borderRight: '1px solid rgba(0,0,0,0.08)', padding: '8px 0' }}>
                <Stat value={st.value} label={st.label} delay={i * 0.1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--dc-cream)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 12 }}>Collections</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)',
              fontWeight: 700, color: 'var(--dc-slate)', margin: 0 }}>
              Shop by Category
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--dc-slate3)', marginTop: 12,
              fontSize: '.95rem', maxWidth: 440, margin: '12px auto 0', lineHeight: 1.7 }}>
              Three worlds of style — find everything you need in one place.
            </p>
          </Reveal>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} variants={staggerItem}>
                <Link to={`/shop?category=${cat.slug}`}
                  style={{ display: 'block', position: 'relative', height: 440, overflow: 'hidden',
                    background: 'var(--dc-slate)', cursor: 'pointer' }}>
                  <motion.div
                    style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cat.image})`,
                      backgroundSize: 'cover', backgroundPosition: 'center' }}
                    whileHover={{ scale: 1.06 }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} />
                  {/* Ink-wash gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(13,11,9,0.85) 0%, rgba(13,11,9,0.2) 55%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 28, left: 24, right: 24 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '2.5px',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{cat.desc}</p>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontStyle: 'italic',
                      color: 'white', margin: '0 0 6px', fontWeight: 700 }}>{cat.name}</h3>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '1.5px', marginBottom: 14 }}>{cat.count}</p>
                    <motion.span whileHover={{ gap: 12 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                        fontFamily: 'var(--font-body)', fontSize: '.75rem', fontWeight: 600,
                        letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--dc-rose)' }}>
                      Shop Now <ChevronRight size={13} />
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══════════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--dc-linen)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
                  textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 10 }}>Curated For You</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)',
                  fontWeight: 700, color: 'var(--dc-slate)', margin: 0 }}>Featured Pieces</h2>
              </div>
              <Link to="/shop">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px',
                    border: '1.5px solid var(--dc-slate)', color: 'var(--dc-slate)',
                    fontFamily: 'var(--font-body)', fontSize: '.75rem', fontWeight: 600,
                    letterSpacing: '1.5px', textTransform: 'uppercase', background: 'transparent', cursor: 'pointer' }}>
                  View All <ArrowRight size={14} />
                </motion.span>
              </Link>
            </div>
          </Reveal>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
            {featured.map((p, i) => (
              <motion.div key={p.id} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.22 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ EDITORIAL BANNER ════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--dc-slate)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 560 }}>
          {/* Image side */}
          <Reveal variants={fadeLeft} style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
            <motion.div style={{ position: 'absolute', inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80)',
              backgroundSize: 'cover', backgroundPosition: 'center' }}
              whileHover={{ scale: 1.04 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,11,9,0.2) 0%, transparent 60%)' }} />
            {/* Est. badge */}
            <motion.div initial={{ opacity: 0, scale: 0.75, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true }} transition={{ delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ position: 'absolute', bottom: 36, right: -12,
                background: 'var(--dc-rose)', color: 'white', padding: '10px 20px',
                fontFamily: 'var(--font-display)', fontSize: '.82rem', fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <Star size={12} fill="white" /> Est. 2020
            </motion.div>
          </Reveal>

          {/* Content side */}
          <Reveal variants={fadeRight}
            style={{ padding: 'clamp(40px,6vw,80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--dc-slate)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 18 }}>The Danis Story</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)',
              fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
              Fashion That Speaks<br /><em style={{ color: 'var(--dc-rose)', fontStyle: 'italic' }}>Your Language</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.85,
              marginBottom: 32, fontSize: '.95rem' }}>
              We believe every woman deserves to look and feel extraordinary. Danis Choice brings you carefully curated fashion — from statement dresses to everyday essentials — because style is personal.
            </p>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {['Ethically sourced materials', 'Designed for real women', 'Kenya-first fashion brand'].map(f => (
                <motion.div key={f} variants={staggerItem}
                  style={{ display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: 'var(--font-body)', fontSize: '.875rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                  <span style={{ width: 20, height: 1, background: 'var(--dc-rose)', flexShrink: 0 }} />
                  {f}
                </motion.div>
              ))}
            </motion.div>

            <Link to="/about">
              <motion.span whileHover={{ gap: 14 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
                  fontFamily: 'var(--font-body)', fontSize: '.78rem', fontWeight: 600,
                  letterSpacing: '1.8px', textTransform: 'uppercase',
                  color: 'var(--dc-rose)', cursor: 'pointer', paddingBottom: 3,
                  borderBottom: '1px solid rgba(201,134,124,0.4)' }}>
                Read Our Story <ArrowRight size={15} />
              </motion.span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ SCROLLING MARQUEE ═══════════════════════════════════════════════ */}
      <div style={{ background: 'var(--dc-rose)', padding: '14px 0', overflow: 'hidden' }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex', width: 'max-content' }}>
          {['CLOTHES', '✦', 'SHOES', '✦', 'BAGS', '✦', 'NEW ARRIVALS', '✦', 'DANIS CHOICE', '✦', 'LADIES FASHION', '✦',
            'CLOTHES', '✦', 'SHOES', '✦', 'BAGS', '✦', 'NEW ARRIVALS', '✦', 'DANIS CHOICE', '✦', 'LADIES FASHION', '✦'].map((w, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '.78rem', fontStyle: i % 2 === 0 ? 'italic' : 'normal',
              fontWeight: i % 2 === 0 ? 700 : 400, color: 'white', padding: '0 20px',
              letterSpacing: i % 2 !== 0 ? '1px' : '-0.2px', opacity: i % 2 !== 0 ? 0.6 : 1 }}>
              {w}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--dc-cream)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 12 }}>What They Say</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)',
              fontWeight: 700, color: 'var(--dc-slate)', margin: 0, fontStyle: 'italic' }}>
              Real Women, Real Stories
            </h2>
          </Reveal>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -6 }}
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)',
                  padding: '32px 28px', position: 'relative' }}>
                <Quote size={28} color="var(--dc-rose-pale)" style={{ position: 'absolute', top: 22, right: 24, opacity: 0.6 }} />
                <div style={{ width: 32, height: 2, background: 'var(--dc-rose)', marginBottom: 20 }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontStyle: 'italic',
                  color: 'var(--dc-slate)', lineHeight: 1.7, marginBottom: 24 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dc-rose-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '.9rem', color: 'var(--dc-rose)', fontWeight: 700 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '.85rem', color: 'var(--dc-slate)' }}>{t.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '1.5px', color: 'var(--dc-slate3)', textTransform: 'uppercase' }}>{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ WHY US ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 0', background: 'var(--dc-linen)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--dc-rose)', marginBottom: 12 }}>Why Shop With Us</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)',
              fontWeight: 700, color: 'var(--dc-slate)', margin: 0 }}>The Danis Difference</h2>
          </Reveal>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
            {WHY.map((w, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -6, background: 'white' }}
                style={{ padding: '36px 28px', background: i % 2 === 0 ? 'white' : 'var(--dc-cream)',
                  transition: 'all .22s', border: '1px solid rgba(0,0,0,0.06)', cursor: 'default' }}>
                <motion.div whileHover={{ scale: 1.1, color: 'var(--dc-rose-deep)' }}
                  style={{ width: 48, height: 48, marginBottom: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'var(--dc-rose-pale)', color: 'var(--dc-rose)', borderRadius: 0 }}>
                  {w.icon}
                </motion.div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--dc-slate)', marginBottom: 10 }}>{w.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--dc-slate3)', lineHeight: 1.7, margin: 0 }}>{w.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: 'var(--dc-slate)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative large italic letter */}
        <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-display)', fontSize: 'clamp(200px,25vw,320px)', fontWeight: 900, fontStyle: 'italic',
          color: 'rgba(201,134,124,0.06)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>D</div>

        <Reveal variants={scaleIn}>
          <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ ease: [0.34, 1.56, 0.64, 1], duration: 0.55 }}
              style={{ marginBottom: 20 }}>
              <Sparkles size={32} color="var(--dc-rose)" />
            </motion.div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)',
              fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
              New Arrivals Drop<br /><em style={{ color: 'var(--dc-rose)', fontStyle: 'italic' }}>Every Week</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.55)',
              fontSize: '.95rem', lineHeight: 1.8, maxWidth: 400, margin: '0 auto 36px' }}>
              Be first to shop fresh styles. Join 50,000+ stylish women in the Danis circle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Link to="/shop">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px',
                    background: 'var(--dc-rose)', color: 'white', fontFamily: 'var(--font-body)',
                    fontSize: '.82rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(201,134,124,0.35)' }}>
                  <Package size={16} /> Shop New Arrivals
                </motion.span>
              </Link>

              <div style={{ width: '100%', maxWidth: 400 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                  Or get style drops in your inbox
                </p>
                <SubscribeForm />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}