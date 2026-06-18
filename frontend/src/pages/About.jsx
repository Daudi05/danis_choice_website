import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Heart, Sparkles, Shield, Truck } from 'lucide-react';
import '../styles/About.css';

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeRight = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

function RevealSection({ children, variants = fadeUp, className = '', style = {} }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className} style={style}>
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: '2020', label: 'Founded' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '2K+',  label: 'Products' },
  { value: '4.9★', label: 'Average Rating' },
];

const VALUES = [
  {
    icon: <Heart size={24} strokeWidth={1.5} />,
    title: 'Made for Real Women',
    desc: 'Every piece we stock is chosen with the modern Kenyan woman in mind — her life, her body, her ambition.',
  },
  {
    icon: <Sparkles size={24} strokeWidth={1.5} />,
    title: 'Curated with Care',
    desc: 'We don\'t just sell fashion. We hand-pick styles that balance beauty, quality, and everyday wearability.',
  },
  {
    icon: <Shield size={24} strokeWidth={1.5} />,
    title: 'Quality Guaranteed',
    desc: 'Every item is inspected before it reaches you. If it\'s not right, we make it right — no questions asked.',
  },
  {
    icon: <Truck size={24} strokeWidth={1.5} />,
    title: 'Kenya-First Delivery',
    desc: 'Same-day delivery in Nairobi CBD and 1–3 day nationwide shipping so your wardrobe never waits.',
  },
];

const TEAM = [
  {
    name: 'Danis Wanjiru',
    role: 'Founder & Creative Director',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    quote: 'Every woman deserves to feel extraordinary in what she wears.',
  },
  {
    name: 'Amara Ochieng',
    role: 'Head of Styling',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
    quote: 'Fashion is how you tell your story before you speak.',
  },
  {
    name: 'Nadia Muthoni',
    role: 'Customer Experience Lead',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    quote: 'Our customers are why we show up every single day.',
  },
];

export default function About() {
  return (
    <div className="about-page">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90"
            alt="Danis Choice"
            className="about-hero-img"
          />
          <div className="about-hero-overlay" />
        </div>
        <motion.div
          className="about-hero-content container"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span variants={fadeUp} className="about-eyebrow">Our Story</motion.span>
          <motion.h1 variants={fadeUp}>
            Where Nairobi<br /><em>Meets Style</em>
          </motion.h1>
          <motion.p variants={fadeUp}>
            Born in Nairobi. Worn across Kenya. Danis Choice is the fashion destination built for the modern African woman.
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <div className="about-stats">
        <div className="container">
          <motion.div
            className="about-stats-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STATS.map(s => (
              <motion.div key={s.label} variants={staggerItem} className="about-stat">
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── STORY SECTION ────────────────────────────────── */}
      <section className="section about-story-section">
        <div className="container about-story-grid">
          <RevealSection variants={fadeLeft} className="about-story-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=85"
              alt="Our Story"
              className="about-story-image"
            />
            <motion.div
              className="about-story-badge"
              initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 4 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'backOut' }}
            >
              <span className="about-story-badge-year">2020</span>
              <span className="about-story-badge-text">Est. Nairobi</span>
            </motion.div>
          </RevealSection>

          <RevealSection variants={fadeRight} className="about-story-content">
            <span className="about-eyebrow">How It Started</span>
            <h2>A Passion for<br />African Femininity</h2>
            <p>
              Danis Choice was born from a simple frustration: finding beautiful, well-made fashion in Nairobi shouldn't be hard. Our founder Danis Wanjiru spent years hunting for pieces that felt both globally stylish and locally relevant — and came up empty too often.
            </p>
            <p>
              In 2020, she decided to build it herself. Starting with a small collection of hand-picked dresses and shoes, she launched Danis Choice from her living room in Westlands. Word spread fast — not just about the clothes, but about the experience: fast delivery, honest sizing, and a team that actually cared.
            </p>
            <p>
              Today we serve over 50,000 customers across Kenya with clothes, shoes, and bags chosen to make every woman feel seen, celebrated, and dressed for whatever the day brings.
            </p>
            <Link to="/shop">
              <motion.span
                className="btn btn-primary about-cta"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Shop the Collection <ArrowRight size={16} />
              </motion.span>
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section className="section about-values-section">
        <div className="container">
          <RevealSection style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="about-eyebrow">What We Stand For</span>
            <h2>Our Values</h2>
          </RevealSection>
          <motion.div
            className="about-values-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {VALUES.map((v, i) => (
              <motion.div key={i} variants={staggerItem} className="about-value-card">
                <motion.div
                  className="about-value-icon"
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  {v.icon}
                </motion.div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── EDITORIAL STRIP ──────────────────────────────── */}
      <section className="about-editorial">
        <div className="about-editorial-inner">
          <div className="about-editorial-image-wrap">
            <img src="https://images.unsplash.com/photo-1594938298603-c8148c4b2efe?w=700&q=85" alt="Clothes" />
          </div>
          <div className="about-editorial-image-wrap">
            <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=85" alt="Shoes" />
          </div>
          <div className="about-editorial-image-wrap">
            <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=85" alt="Bags" />
          </div>
          <div className="about-editorial-text">
            <span className="about-eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Everything You Need</span>
            <h2>Clothes. Shoes.<br />Bags. Done.</h2>
            <p>Three categories. Thousands of possibilities. All in one place, delivered to your door.</p>
            <Link to="/shop" className="btn btn-outline-white" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
              Explore All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────── */}
      <section className="section about-team-section">
        <div className="container">
          <RevealSection style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="about-eyebrow">The People Behind It</span>
            <h2>Meet the Team</h2>
          </RevealSection>
          <motion.div
            className="about-team-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {TEAM.map((member, i) => (
              <motion.div key={i} variants={staggerItem} className="about-team-card">
                <div className="about-team-image-wrap">
                  <img src={member.image} alt={member.name} className="about-team-image" />
                </div>
                <div className="about-team-info">
                  <div className="about-team-name">{member.name}</div>
                  <div className="about-team-role">{member.role}</div>
                  <p className="about-team-quote">"{member.quote}"</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="about-cta-banner">
        <RevealSection className="container about-cta-inner">
          <span className="about-eyebrow" style={{ color: 'var(--rose, #c9867c)' }}>Ready?</span>
          <h2>Your Next Favourite<br />Outfit is Waiting</h2>
          <p>Join 50,000+ women who shop with Danis Choice. Free delivery on your first order.</p>
          <div className="about-cta-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </RevealSection>
      </section>

    </div>
  );
}