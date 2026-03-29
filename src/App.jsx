import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Github, Linkedin, Mail, ExternalLink, Menu, X, Code2,
  BarChart3, Cpu, Zap, Server, Database, GitBranch,
  Download, Eye, ChevronRight, ArrowUpRight, Terminal,
  Layers, Activity, Box, Globe, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   1. SCROLL REVEAL HOOK
═══════════════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = '', style: externalStyle = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...externalStyle,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   2. UPGRADE: CUSTOM MAGNETIC CURSOR
═══════════════════════════════════════════════════ */
function MagneticCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onEnter = (e) => {
      if (e.target.closest('button,a,[data-cursor]')) setHovering(true);
    };
    const onLeave = (e) => {
      if (e.target.closest('button,a,[data-cursor]')) setHovering(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onEnter);
    window.addEventListener('mouseout', onLeave);

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnter);
      window.removeEventListener('mouseout', onLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        width: hovering ? 12 : 8, height: hovering ? 12 : 8,
        borderRadius: '50%', background: hovering ? '#60a5fa' : '#3b82f6',
        willChange: 'transform',
        transition: 'width 0.2s, height 0.2s, background 0.2s',
        mixBlendMode: 'screen',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none',
        width: hovering ? 50 : 40, height: hovering ? 50 : 40,
        borderRadius: '50%',
        border: `1.5px solid ${hovering ? 'rgba(96,165,250,0.7)' : 'rgba(255,255,255,0.25)'}`,
        willChange: 'transform',
        transition: 'width 0.25s, height 0.25s, border-color 0.25s',
      }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   3. UPGRADE: SCROLL PROGRESS BAR (attached to nav)
═══════════════════════════════════════════════════ */
function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return pct;
}

/* ═══════════════════════════════════════════════════
   4. UPGRADE: TYPEWRITER HOOK
═══════════════════════════════════════════════════ */
function useTypewriter(phrases, typingSpeed = 60, erasingSpeed = 35, pauseMs = 1600) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const target = phrases[idx];
    let t;
    if (phase === 'typing') {
      if (displayed.length < target.length) {
        t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), typingSpeed);
      } else {
        t = setTimeout(() => setPhase('pause'), pauseMs);
      }
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('erasing'), 400);
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), erasingSpeed);
      } else {
        setIdx((idx + 1) % phrases.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [displayed, phase, idx]);

  return displayed;
}

/* ═══════════════════════════════════════════════════
   5. UPGRADE: ANIMATED COUNTER HOOK
═══════════════════════════════════════════════════ */
function useCounter(target, duration = 1600, active = false) {
  const [val, setVal] = useState(0);
  const hasRun = useRef(false);
  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    const steps = 55;
    const inc = target / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setVal(cur);
      if (cur >= target) clearInterval(iv);
    }, duration / steps);
    return () => clearInterval(iv);
  }, [active, target, duration]);
  return val;
}

function AnimatedStat({ target, suffix = '', label, color, active }) {
  const val = useCounter(target, 1600, active);
  const display = target >= 1000
    ? `${(val / 1000).toFixed(0)}K`
    : target % 1 !== 0
      ? val.toFixed(1)
      : Math.round(val).toString();
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 300, color, fontFamily: 'monospace', lineHeight: 1 }}>
        {display}{suffix}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   6. UPGRADE: 3D TILT CARD WRAPPER
═══════════════════════════════════════════════════ */
function TiltCard({ children, color = '#3b82f6', style: outerStyle = {}, className = '' }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const onMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const rx = (cy / rect.height) * -14;
    const ry = (cx / rect.width) * 14;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    card.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4)`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, ${color}22 0%, transparent 60%)`;
    }
  };
  const onLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      cardRef.current.style.boxShadow = 'none';
    }
    if (glowRef.current) glowRef.current.style.background = 'transparent';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        ...outerStyle,
        transition: 'transform 0.12s ease, box-shadow 0.2s ease',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div ref={glowRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'background 0.1s', zIndex: 0, borderRadius: 'inherit' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   7. UPGRADE: ⌘K COMMAND PALETTE
═══════════════════════════════════════════════════ */
function CommandPalette({ onClose, scrollTo, setShowResume, setDevMode, devMode }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const allCommands = [
    { icon: '🏠', label: 'Go to Home', shortcut: 'H', action: () => { scrollTo('home'); onClose(); } },
    { icon: '🚀', label: 'View Projects', shortcut: 'P', action: () => { scrollTo('projects'); onClose(); } },
    { icon: '💼', label: 'Experience', shortcut: 'E', action: () => { scrollTo('experience'); onClose(); } },
    { icon: '👤', label: 'About Me', shortcut: 'A', action: () => { scrollTo('about'); onClose(); } },
    { icon: '📬', label: 'Contact', shortcut: 'C', action: () => { scrollTo('contact'); onClose(); } },
    { icon: '📄', label: 'View Resume', shortcut: 'R', action: () => { setShowResume(true); onClose(); } },
    { icon: '⌨️', label: devMode ? 'Switch to Recruiter Mode' : 'Switch to Dev Mode', shortcut: 'D', action: () => { setDevMode(d => !d); onClose(); } },
    { icon: '📧', label: 'Send Email', shortcut: '', action: () => { window.location.href = 'mailto:abhishekkanwar78@gmail.com'; onClose(); } },
    { icon: '🐙', label: 'Open GitHub', shortcut: '', action: () => { window.open('https://github.com/T9kezo', '_blank'); onClose(); } },
    { icon: '💼', label: 'Open LinkedIn', shortcut: '', action: () => { window.open('https://www.linkedin.com/in/abhishek-kanwar-204017261', '_blank'); onClose(); } },
  ];

  const filtered = allCommands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setActiveIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && filtered[activeIdx]) filtered[activeIdx].action();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, activeIdx, onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 520, borderRadius: 16, background: '#0d0d14', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', animation: 'cmdSlideIn 0.18s ease', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: 16, opacity: 0.4 }}>🔍</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search commands or navigate..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8e8e8', fontSize: 14, fontFamily: 'inherit' }} />
          <kbd style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No results</div>
          )}
          {filtered.map((cmd, i) => (
            <div key={i} onClick={cmd.action}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', background: i === activeIdx ? 'rgba(59,130,246,0.12)' : 'transparent', borderLeft: `2px solid ${i === activeIdx ? '#3b82f6' : 'transparent'}`, transition: 'background 0.1s' }}
              onMouseEnter={() => setActiveIdx(i)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: i === activeIdx ? '#e8e8e8' : 'rgba(255,255,255,0.5)' }}>
                <span style={{ fontSize: 15 }}>{cmd.icon}</span>
                {cmd.label}
              </div>
              {cmd.shortcut && (
                <kbd style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>{cmd.shortcut}</kbd>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16 }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([key, hint]) => (
            <span key={key} style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>{key}</kbd>
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ARCHITECTURE DIAGRAM (unchanged)
═══════════════════════════════════════════════════ */
function ArchitectureDiagram() {
  return (
    <div className="mt-4 p-4 rounded-xl overflow-x-auto" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(6,182,212,0.2)' }}>
      <p className="text-xs text-cyan-400 mb-3 uppercase tracking-widest" style={{ fontFamily: 'monospace' }}>// System Architecture</p>
      <svg viewBox="0 0 520 160" className="w-full max-w-lg mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[
          { x: 15,  y: 60, w: 90, label: ['React', 'Client'],    color: '#06b6d4' },
          { x: 140, y: 60, w: 90, label: ['Socket.IO', 'Server'], color: '#3b82f6' },
          { x: 265, y: 15, w: 85, label: ['Redis', 'Cache'],     color: '#ef4444' },
          { x: 265, y: 95, w: 85, label: ['Node.js', 'API'],     color: '#22c55e' },
          { x: 390, y: 60, w: 90, label: ['MongoDB', 'Atlas'],   color: '#f59e0b' },
        ].map(({ x, y, w, label, color }) => (
          <g key={label[0]}>
            <rect x={x} y={y} width={w} height={40} rx="6"
              fill={color + '1a'} stroke={color + '70'} strokeWidth="1.5" />
            <text x={x + w/2} y={y + 14} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace">{label[0]}</text>
            <text x={x + w/2} y={y + 27} textAnchor="middle" fill={color + 'aa'} fontSize="8" fontFamily="monospace">{label[1]}</text>
          </g>
        ))}
        {[
          [105, 80, 140, 80],
          [230, 75, 265, 35],
          [230, 85, 265, 115],
          [350, 35, 390, 70],
          [350, 115, 390, 90],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#ffffff25" strokeWidth="1.5" strokeDasharray="4 3"
            markerEnd="url(#arrowhead)" />
        ))}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#ffffff40" />
          </marker>
        </defs>
      </svg>
      <div className="flex gap-3 mt-3 flex-wrap">
        {['60% faster response via Redis', 'WS bi-directional comms', 'Message queue + history'].map(t => (
          <span key={t} className="text-xs px-2 py-0.5 rounded"
            style={{ fontFamily: 'monospace', color: '#22d3ee99', border: '1px solid rgba(6,182,212,0.2)' }}>✓ {t}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RESUME MODAL (unchanged)
═══════════════════════════════════════════════════ */
function ResumeModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl"
        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulseDot 2s infinite' }} />
            <span className="text-xs text-white uppercase tracking-widest" style={{ fontFamily: 'monospace' }}>Resume · Quick View</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/Abhishek Resume.pdf" download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }}>
              <Download size={11} /> PDF
            </a>
            <button onClick={onClose} className="text-white opacity-40 hover:opacity-100 transition-opacity"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem' }}>
            <h2 className="text-2xl font-light text-white tracking-tight">Abhishek Kanwar</h2>
            <p className="text-sm mt-1" style={{ color: '#60a5fa' }}>Full Stack Developer · BCA — Shoolini University, HP</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>abhishekkanwar78@gmail.com</span>
              <span>+91-6230163589</span>
              <span>Solan, HP, India</span>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Experience</p>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between flex-wrap gap-1 mb-1">
                <span className="text-sm font-medium text-white">Full Stack Developer Intern — Unified Mentor</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>Nov 2025 – Feb 2026</span>
              </div>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Remote, India</p>
              <ul className="space-y-1 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {['5+ production apps · 10,000+ MAU · 99.9% uptime', 'Redis caching — 60% faster API response', '15+ features shipped via Agile sprints', 'AI tools integration — 25% dev time reduction'].map(i => (
                  <li key={i} className="flex gap-2"><span style={{ color: '#3b82f6' }}>→</span>{i}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Technical Skills</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { c: 'Frontend',   i: 'React.js, Vue.js, Tailwind CSS, Material-UI',     col: '#3b82f6' },
                { c: 'Backend',    i: 'Node.js, Express.js, Django, Kafka, GraphQL',     col: '#22c55e' },
                { c: 'Databases',  i: 'MongoDB, PostgreSQL, Redis, Firebase, MySQL',     col: '#f59e0b' },
                { c: 'DevOps',     i: 'Docker, AWS EC2/S3/Lambda, CI/CD, Linux',         col: '#ef4444' },
                { c: 'AI & Tools', i: 'ChatGPT API, GitHub Copilot, Prompt Engineering', col: '#a855f7' },
                { c: 'Languages',  i: 'Python, JavaScript ES6+, PHP, SQL, HTML5',        col: '#06b6d4' },
              ].map(({ c, i, col }) => (
                <div key={c} className="p-3 rounded-lg" style={{ background: col + '10', border: `1px solid ${col}25` }}>
                  <p className="text-xs mb-1 font-medium" style={{ color: col }}>{c}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{i}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Certifications</p>
            <div className="space-y-2">
              {[
                { n: 'Software Engineering Job Simulation', o: 'JPMorgan Chase & Co. · Forage', c: '#1e40af' },
                { n: 'GenAI Powered Data Analytics Simulation', o: 'Tata Group · Forage', c: '#0891b2' },
                { n: 'Enterprise Design Thinking Practitioner', o: 'IBM', c: '#4f46e5' },
                { n: 'Web Development Fundamentals', o: 'IBM SkillsBuild', c: '#7c3aed' },
              ].map(({ n, o, c }) => (
                <div key={n} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: c + '12', border: `1px solid ${c}35` }}>
                  <div className="w-1 rounded-full mt-0.5 flex-shrink-0" style={{ background: c, height: '2.5rem' }} />
                  <div>
                    <p className="text-xs text-white font-medium">{n}</p>
                    <p className="text-xs mt-0.5" style={{ color: c + 'bb' }}>{o}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════════════ */
const FORMSPREE_ID = 'mykngwww';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); }
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 4000); }
  };

  const isBusy = status === 'sending';
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input type="text" value={formData.name} disabled={isBusy}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="Your Name" required />
      <input type="email" value={formData.email} disabled={isBusy}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        placeholder="Your Email" required />
      <textarea value={formData.message} disabled={isBusy}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
        placeholder="Your Message" required rows="5" style={{ resize: 'none' }} />
      {status === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '13px' }}>
          <CheckCircle size={15} /> Message sent! I'll get back to you soon.
        </div>
      )}
      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '13px' }}>
          <AlertCircle size={15} /> Something went wrong — try emailing directly.
        </div>
      )}
      <button type="submit" disabled={isBusy} className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 500, opacity: isBusy ? 0.7 : 1 }}>
        {isBusy ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send Message'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [showArch, setShowArch] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showCmd, setShowCmd] = useState(false);

  const scrollProgress = useScrollProgress();
  const typewriterText = useTypewriter([
    'Full Stack Developer',
    'React Engineer',
    'Backend Architect',
    'AI-Enhanced Builder',
    'Node.js Specialist',
  ]);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCmd(c => !c); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const sections = ['home', 'projects', 'experience', 'about', 'contact'];
      const cur = sections.find(s => {
        const el = document.getElementById(s);
        if (el) { const r = el.getBoundingClientRect(); return r.top <= 120 && r.bottom >= 120; }
        return false;
      });
      if (cur) setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 769) setIsMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); };

  /* ── COUNTER ACTIVATION via IntersectionObserver ── */
  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setStatsActive(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── DATA ── */
  const projects = [
    {
      title: 'Real-Time Chat Application',
      desc: 'Scalable messaging platform with bidirectional WebSocket connections, user auth, and persistent message history. Engineered with Redis pub/sub for high-volume traffic at minimal latency.',
      tech: ['Node.js', 'Socket.IO', 'React', 'MongoDB', 'Redis'],
      badges: ['60% faster responses', 'WebSocket', 'Redis pub/sub'],
      color: '#06b6d4',
      hasArch: true,
    },
    {
      title: 'Production Web Applications',
      desc: '5+ production apps built at Unified Mentor with Redis caching, AWS infrastructure and zero-downtime CI/CD pipelines, serving a global audience at scale.',
      tech: ['React', 'Node.js', 'Redis', 'AWS EC2', 'Docker'],
      badges: ['10,000+ MAU', '99.9% uptime', 'AWS Lambda'],
      color: '#22c55e',
      hasArch: false,
    },
    {
      title: 'Weather Application',
      desc: 'Real-time weather platform with 7-day forecasts, geolocation, and intelligent city auto-complete. Integrates third-party REST APIs with robust error handling and fallback mechanisms.',
      tech: ['JavaScript', 'REST API', 'HTML5', 'CSS3'],
      badges: ['Live data', 'Geolocation API', 'Responsive'],
      color: '#3b82f6',
      hasArch: false,
    },
    {
      title: 'Cruise Ship Management System',
      desc: 'Comprehensive operations system with interactive dashboards for booking management, passenger tracking, capacity monitoring, and live revenue analytics.',
      tech: ['JavaScript', 'HTML5', 'CSS3', 'JSON'],
      badges: ['Full dashboard', 'Real-time analytics', 'CRUD ops'],
      color: '#a855f7',
      hasArch: false,
    },
  ];

  const experiences = [
    {
      company: 'JPMorgan Chase & Co.',
      program: 'Software Engineering Job Simulation',
      period: 'Feb 2026 · Forage',
      tasks: ['Project Setup', 'Kafka Integration', 'H2 Integration', 'REST API Integration', 'REST API Controller'],
      color: '#1e40af',
      icon: <Server size={16} />,
      desc: 'Replicated real-world financial engineering tasks — building event-driven microservices with Kafka, H2 in-memory DB, and production-grade REST controllers at JPMorgan scale.',
    },
    {
      company: 'Tata Group',
      program: 'GenAI Powered Data Analytics Simulation',
      period: 'Feb 2026 · Forage',
      tasks: ['EDA & Risk Profiling', 'Delinquency Prediction AI', 'Business Storytelling', 'AI Collections Strategy'],
      color: '#0891b2',
      icon: <BarChart3 size={16} />,
      desc: "Applied GenAI for risk profiling, predictive modelling and data-driven business strategy at enterprise scale using Forage's simulation environment.",
    },
    {
      company: 'IBM',
      program: 'Enterprise Design Thinking Practitioner',
      period: '2025',
      tasks: ['Design Thinking', 'User Research', 'Prototyping', 'Iteration'],
      color: '#4f46e5',
      icon: <Layers size={16} />,
      desc: "Certified in IBM's Enterprise Design Thinking — user-centric problem framing and solution design for large-scale systems.",
    },
    {
      company: 'IBM SkillsBuild',
      program: 'Web Development Fundamentals',
      period: '2025',
      tasks: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
      color: '#7c3aed',
      icon: <Globe size={16} />,
      desc: 'IBM-certified foundations of modern web development including responsive design and core web technologies.',
    },
  ];

  const techCats = {
    'AI & Automation': { items: ['ChatGPT API', 'GitHub Copilot', 'Prompt Engineering', 'GenAI Analytics', 'Power BI'], color: '#a855f7' },
    'Backend':         { items: ['Node.js', 'Express.js', 'Django', 'Flask', 'Kafka', 'GraphQL', 'Microservices'], color: '#22c55e' },
    'Frontend':        { items: ['React.js', 'Vue.js', 'Tailwind CSS', 'Material-UI', 'jQuery'], color: '#3b82f6' },
    'Database':        { items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'], color: '#f59e0b' },
    'DevOps & Cloud':  { items: ['Docker', 'AWS EC2', 'AWS S3', 'AWS Lambda', 'CI/CD', 'Linux', 'Nginx'], color: '#ef4444' },
    'Languages':       { items: ['Python', 'JavaScript ES6+', 'PHP', 'SQL', 'HTML5', 'CSS3'], color: '#06b6d4' },
  };

  const fontStack = devMode ? '"JetBrains Mono", "Fira Code", monospace' : '"Space Grotesk", system-ui, sans-serif';

  return (
    <div style={{ background: 'linear-gradient(135deg, #060610 0%, #0a0a1a 100%)', minHeight: '100vh', color: '#e8e8e8', fontFamily: fontStack, cursor: 'none' }}>

      {/* ── UPGRADE 1: Magnetic Cursor ── */}
      <MagneticCursor />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(59,130,246,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060610; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cmdSlideIn{ from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes grainMove { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-2%,-1%)} 75%{transform:translate(2%,1%)} }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .card-hover { transition: all 0.4s ease; }
        .card-hover:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.14);
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          border-radius: 10px;
          transition: all 0.25s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(37,99,235,0.35);
        }
        input, textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #e8e8e8;
          border-radius: 10px;
          padding: 12px 16px;
          width: 100%;
          transition: border-color 0.25s ease;
          outline: none;
          font-family: inherit;
        }
        input:focus, textarea:focus { border-color: rgba(59,130,246,0.5); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
        input:disabled, textarea:disabled { opacity: 0.6; cursor: not-allowed; }

        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .bento-full  { grid-column: 1 / -1; }
        .bento-span2 { grid-column: span 2; }
        .nav-links   { display: flex; }
        .menu-btn    { display: none; }

        @media (max-width: 768px) {
          .nav-links  { display: none !important; }
          .menu-btn   { display: flex !important; }
          .bento-grid { grid-template-columns: 1fr; }
          .bento-full  { grid-column: 1; }
          .bento-span2 { grid-column: 1; }
          section#home { padding-top: 100px !important; }
        }
        @media (max-width: 480px) {
          .resume-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── UPGRADE 7: Atmospheric Background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Gradient mesh orbs */}
        <div style={{ position: 'absolute', top: '8%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '55%', right: '3%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        {/* SVG grain noise */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" style={{ animation: 'grainMove 8s steps(1) infinite' }} />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(6,6,16,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* ── UPGRADE 6: Scroll progress bar ── */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: `${scrollProgress}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '0 2px 2px 0', transition: 'width 0.08s linear' }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <button onClick={() => scrollTo('home')} style={{ fontSize: '1.1rem', fontWeight: 400, color: devMode ? '#22c55e' : '#e8e8e8', letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'none', transition: 'color 0.25s' }}>
              {devMode ? '<AK />' : 'AK'}
            </button>

            <div className="nav-links" style={{ alignItems: 'center', gap: '24px' }}>
              {['home', 'projects', 'experience', 'about', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)} style={{
                  background: 'none', border: 'none', cursor: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: activeSection === s ? '#3b82f6' : 'rgba(255,255,255,0.38)',
                  transition: 'color 0.25s',
                }}>{s}</button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* ⌘K trigger button */}
              <button onClick={() => setShowCmd(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'none', transition: 'all 0.25s', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)',
              }}>
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)' }}>⌘K</span>
              </button>

              <button onClick={() => setDevMode(d => !d)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'none', transition: 'all 0.25s', border: 'none',
                background: devMode ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                color: devMode ? '#4ade80' : '#60a5fa',
                outline: `1px solid ${devMode ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
              }}>
                {devMode ? '⌨ Dev Mode' : '📊 Recruiter'}
              </button>

              <button onClick={() => setShowResume(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', transition: 'all 0.25s',
              }}>
                <Eye size={11} /> Resume
              </button>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-btn" aria-label="Toggle navigation"
                style={{ background: 'none', border: 'none', cursor: 'none', color: 'rgba(255,255,255,0.5)' }}>
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="glass" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {['home', 'projects', 'experience', 'about', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)} style={{
                  display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'none',
                  padding: '10px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: activeSection === s ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontFamily: 'inherit',
                }}>{s}</button>
              ))}
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '960px', width: '100%', animation: 'fadeUp 0.75s ease' }}>
            {/* Status pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulseDot 2s infinite' }} />
                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 500, letterSpacing: '0.04em' }}>Available for 2026 Roles</span>
              </div>
              {devMode && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                  <span style={{ fontSize: '11px', color: '#fbbf24', fontFamily: 'monospace' }}>DEV_MODE=true · NODE_ENV=production</span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1 style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: '20px' }}>
              {devMode ? (
                <><span style={{ color: 'rgba(34,197,94,0.65)' }}>const </span>Abhishek<br />
                  <span style={{ color: 'rgba(34,197,94,0.65)' }}>= </span><span style={{ color: '#60a5fa' }}>Kanwar</span><span style={{ color: 'rgba(34,197,94,0.65)' }}>;</span></>
              ) : (
                <>Abhishek<br /><span style={{ color: '#3b82f6' }}>Kanwar</span></>
              )}
            </h1>

            {/* ── UPGRADE 2: Typewriter text ── */}
            {!devMode && (
              <div style={{ fontSize: 'clamp(1rem,2.5vw,1.4rem)', fontWeight: 300, marginBottom: '28px', color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em', height: '2em', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6' }}>{typewriterText}</span>
                <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: '#3b82f6', marginLeft: 3, animation: 'blink 0.9s step-end infinite', verticalAlign: 'middle' }} />
              </div>
            )}

            {devMode && (
              <div className="glass" style={{ borderRadius: '14px', padding: '20px', maxWidth: '640px', marginBottom: '28px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '11px', color: 'rgba(34,197,94,0.5)', fontFamily: 'monospace', marginBottom: '10px' }}>// developer.profile.js</div>
                {[
                  { k: 'role',   v: '"Full Stack Developer"',                              vc: '#86efac' },
                  { k: 'core',   v: '["React", "Node.js", "Kafka", "Redis", "Docker"]',    vc: '#fde68a' },
                  { k: 'cloud',  v: '["AWS EC2", "S3", "Lambda", "CI/CD"]',                vc: '#fde68a' },
                  { k: 'ai',     v: '["ChatGPT API", "GitHub Copilot", "GenAI"]',           vc: '#fde68a' },
                  { k: 'impact', v: '{ mau:"10K+", uptime:"99.9%", perf:"+60%" }',         vc: '#67e8f9' },
                ].map(({ k, v, vc }) => (
                  <div key={k} style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)' }}>
                    <span style={{ color: '#c084fc' }}>{k}</span>: <span style={{ color: vc }}>{v}</span>,
                  </div>
                ))}
              </div>
            )}

            {/* ── UPGRADE 4: Animated stat counters ── */}
            <div ref={statsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '32px', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <AnimatedStat target={10000} suffix="+" label="Monthly Users" color="#22c55e" active={statsActive} />
              <AnimatedStat target={99.9} suffix="%" label="Uptime" color="#3b82f6" active={statsActive} />
              <AnimatedStat target={5} suffix="+" label="Production Apps" color="#06b6d4" active={statsActive} />
              <AnimatedStat target={60} suffix="%" label="Faster APIs" color="#a855f7" active={statsActive} />
            </div>

            {/* Social + CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              {[
                { href: 'https://github.com/T9kezo', icon: <Github size={20} /> },
                { href: 'https://www.linkedin.com/in/abhishek-kanwar-204017261', icon: <Linkedin size={20} /> },
                { href: 'mailto:abhishekkanwar78@gmail.com', icon: <Mail size={20} /> },
              ].map(({ href, icon }) => (
                <a key={href} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.38)', transition: 'color 0.25s', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                  {icon}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('projects')} className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'none' }}>
                View Work
              </button>
              <button onClick={() => setShowResume(true)} className="glass card-hover"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'none' }}>
                <Eye size={14} /> Quick Resume
              </button>
            </div>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section id="projects" style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: '8px' }}>
                {devMode ? '// Selected Work' : 'Selected Work'}
              </p>
              <h2 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                {devMode ? '<Projects />' : <><span>Selected</span> <span style={{ color: '#3b82f6' }}>Work</span></>}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginBottom: '56px' }}>Production-ready applications serving thousands of users</p>
            </Reveal>

            {/* ── UPGRADE 3: 3D Tilt Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))', gap: '20px' }}>
              {projects.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <TiltCard color={p.color} style={{ borderRadius: '18px', padding: '28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', height: '100%' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${p.color}18 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 500, marginBottom: '12px', lineHeight: 1.3 }}>{p.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {p.badges.map(b => (
                        <span key={b} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: p.color + '15', border: `1px solid ${p.color}35`, color: p.color }}>⚡ {b}</span>
                      ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '14px', lineHeight: 1.7, fontWeight: 300, marginBottom: '18px' }}>{p.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: p.hasArch ? '16px' : '0' }}>
                      {p.tech.map(t => (
                        <span key={t} style={{ padding: '4px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.38)', borderRadius: '6px' }}>{t}</span>
                      ))}
                    </div>
                    {p.hasArch && (
                      <>
                        <button onClick={() => setShowArch(a => !a)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid rgba(6,182,212,${showArch ? '0.4' : '0.2'})`, cursor: 'none',
                          color: `rgba(6,182,212,${showArch ? '0.9' : '0.6'})`, padding: '7px 14px', borderRadius: '8px', fontSize: '12px', transition: 'all 0.25s',
                        }}>
                          <GitBranch size={12} />
                          {showArch ? 'Hide' : 'View'} Architecture
                          <ChevronRight size={11} style={{ transform: showArch ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s' }} />
                        </button>
                        {showArch && <ArchitectureDiagram />}
                      </>
                    )}
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={350}>
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <a href="https://github.com/T9kezo" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', transition: 'color 0.25s', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                  View All on GitHub <ArrowUpRight size={14} />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── EXPERIENCE BENTO GRID ── */}
        <section id="experience" style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: '8px' }}>
                {devMode ? '// Industry Simulations' : 'Industry Simulations'}
              </p>
              <h2 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                {devMode ? '<Experience />' : <><span>Professional</span> <span style={{ color: '#3b82f6' }}>Experience</span></>}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginBottom: '56px' }}>Real-world simulations with Fortune 500 companies via Forage</p>
            </Reveal>

            <div className="bento-grid">
              <Reveal className="bento-full" delay={0}>
                <div className="card-hover" style={{ borderRadius: '18px', padding: '28px', border: '1px solid rgba(30,64,175,0.45)', background: 'linear-gradient(135deg,rgba(30,64,175,0.13) 0%,rgba(30,64,175,0.05) 100%)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at top right, rgba(30,64,175,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(30,64,175,0.25)', color: '#60a5fa' }}><Server size={18} /></div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'white', fontSize: '1rem' }}>{experiences[0].company}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', fontFamily: devMode ? 'monospace' : 'inherit' }}>{experiences[0].period}</p>
                      </div>
                    </div>
                    <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.4)', color: '#93c5fd' }}>Certified · Feb 2026</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'white', marginBottom: '10px' }}>{experiences[0].program}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '13px', lineHeight: 1.7, fontWeight: 300, marginBottom: '16px' }}>{experiences[0].desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {experiences[0].tasks.map(t => (
                      <span key={t} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(30,64,175,0.3)', color: '#93c5fd' }}>{t}</span>
                    ))}
                  </div>
                  {devMode && <p style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' }}>{'// Stack: Kafka, Spring Boot, H2, Maven, REST'}</p>}
                </div>
              </Reveal>

              <Reveal className="bento-span2" delay={80}>
                <div className="card-hover" style={{ height: '100%', borderRadius: '18px', padding: '24px', border: '1px solid rgba(8,145,178,0.4)', background: 'linear-gradient(135deg,rgba(8,145,178,0.12) 0%,rgba(8,145,178,0.04) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ padding: '9px', borderRadius: '10px', background: 'rgba(8,145,178,0.25)', color: '#22d3ee' }}><BarChart3 size={16} /></div>
                    <div>
                      <p style={{ fontWeight: 500, color: 'white', fontSize: '0.95rem' }}>{experiences[1].company}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{experiences[1].period}</p>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'white', marginBottom: '8px' }}>{experiences[1].program}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.43)', fontSize: '12px', lineHeight: 1.7, fontWeight: 300, marginBottom: '14px' }}>{experiences[1].desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {experiences[1].tasks.map(t => (
                      <span key={t} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', background: 'rgba(8,145,178,0.15)', border: '1px solid rgba(8,145,178,0.3)', color: '#67e8f9' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="card-hover" style={{ borderRadius: '18px', padding: '22px', border: '1px solid rgba(79,70,229,0.4)', background: 'linear-gradient(135deg,rgba(79,70,229,0.12) 0%,rgba(79,70,229,0.04) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '9px', background: 'rgba(79,70,229,0.25)', color: '#a78bfa' }}><Layers size={15} /></div>
                    <p style={{ fontWeight: 500, color: 'white', fontSize: '0.9rem' }}>{experiences[2].company}</p>
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'white', marginBottom: '8px' }}>{experiences[2].program}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', lineHeight: 1.6, marginBottom: '12px', fontWeight: 300 }}>{experiences[2].desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {experiences[2].tasks.map(t => (
                      <span key={t} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '10px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', color: '#c4b5fd' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={140}>
                <div className="card-hover" style={{ borderRadius: '18px', padding: '22px', border: '1px solid rgba(124,58,237,0.35)', background: 'linear-gradient(135deg,rgba(124,58,237,0.1) 0%,rgba(124,58,237,0.04) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '9px', background: 'rgba(124,58,237,0.25)', color: '#c084fc' }}><Globe size={15} /></div>
                    <p style={{ fontWeight: 500, color: 'white', fontSize: '0.9rem' }}>{experiences[3].company}</p>
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'white', marginBottom: '8px' }}>{experiences[3].program}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', lineHeight: 1.6, fontWeight: 300 }}>{experiences[3].desc}</p>
                </div>
              </Reveal>

              <Reveal className="bento-full" delay={180}>
                <div className="glass card-hover" style={{ borderRadius: '18px', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}><Activity size={20} /></div>
                    <div>
                      <p style={{ fontWeight: 500, color: 'white' }}>Full Stack Developer Intern — Unified Mentor</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', fontFamily: devMode ? 'monospace' : 'inherit' }}>Nov 2025 – Feb 2026 · Remote, India</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['10K+ MAU', '99.9% Uptime', '60% Faster APIs', '5+ Apps Deployed', 'Redis + AWS'].map(m => (
                      <span key={m} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>{m}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── ABOUT + TECH SKILLS ── */}
        <section id="about" style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: '8px' }}>About</p>
              <h2 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '52px' }}>
                {devMode ? '<About />' : <><span>About </span><span style={{ color: '#3b82f6' }}>Me</span></>}
              </h2>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,480px),1fr))', gap: '64px' }}>
              <Reveal>
                <div>
                  <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, fontWeight: 300, marginBottom: '20px' }}>
                    Full Stack Developer pursuing BCA at Shoolini University, specialising in React, Node.js, and AI-enhanced development workflows.
                  </p>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, fontWeight: 300, marginBottom: '28px' }}>
                    I've architected apps serving 10,000+ monthly active users at 99.9% uptime, achieved 60% faster API responses with Redis caching, and integrated AI tools to cut development time by 25%.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['5+ production apps · 10K+ MAU · 99.9% uptime', 'Certified: JPMorgan Chase, Tata Group & IBM', 'Agile practitioner — 15+ features/sprint'].map(a => (
                      <div key={a} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.48)', fontWeight: 300 }}>
                        <ChevronRight size={14} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} /> {a}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'white', marginBottom: '24px' }}>Technical Expertise</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.entries(techCats).map(([cat, { items, color }]) => (
                      <div key={cat}>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color, marginBottom: '8px', fontWeight: 500 }}>{cat}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {items.map(item => (
                            <span key={item} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'none', background: color + '10', border: `1px solid ${color}28`, color: color + 'cc', transition: 'all 0.2s ease' }}
                              onMouseEnter={e => { e.target.style.background = color + '22'; e.target.style.borderColor = color + '55'; e.target.style.transform = 'scale(1.04)'; }}
                              onMouseLeave={e => { e.target.style.background = color + '10'; e.target.style.borderColor = color + '28'; e.target.style.transform = 'scale(1)'; }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" style={{ padding: '120px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Reveal>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: '8px' }}>Contact</p>
              <h2 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '12px' }}>
                {devMode ? '<Contact />' : <><span>Get In </span><span style={{ color: '#3b82f6' }}>Touch</span></>}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginBottom: '52px' }}>Let's collaborate on something great</p>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,480px),1fr))', gap: '64px' }}>
              <Reveal><ContactForm /></Reveal>
              <Reveal delay={120}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass" style={{ borderRadius: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>Contact Details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a href="mailto:abhishekkanwar78@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.25s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                        <Mail size={16} style={{ color: '#3b82f6' }} /> abhishekkanwar78@gmail.com
                      </a>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.38)', fontSize: '14px' }}>
                        <span style={{ color: '#3b82f6' }}>📍</span> Solan, Himachal Pradesh, India
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
                      {[
                        { href: 'https://github.com/T9kezo', icon: <Github size={20} /> },
                        { href: 'https://www.linkedin.com/in/abhishek-kanwar-204017261', icon: <Linkedin size={20} /> },
                      ].map(({ href, icon }) => (
                        <a key={href} href={href} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.38)', transition: 'color 0.25s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
                          {icon}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="glass" style={{ borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulseDot 2s infinite' }} />
                      <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>Available for 2026 Roles</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>Open to full-time positions and freelance projects worldwide.</p>
                    <button onClick={() => setShowResume(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', background: 'none', border: 'none', cursor: 'none', fontSize: '12px', color: 'rgba(59,130,246,0.65)', transition: 'color 0.25s', fontFamily: 'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(59,130,246,0.65)'}>
                      <Eye size={12} /> View Resume Online
                    </button>
                  </div>

                  {/* ⌘K hint card */}
                  <div className="glass" style={{ borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <kbd style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>⌘ K</kbd>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>Press to open command palette — navigate anywhere instantly</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>© 2026 Abhishek Kanwar</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>React + Tailwind CSS + Vite</p>
            <button onClick={() => setDevMode(d => !d)} style={{ background: 'none', border: 'none', cursor: 'none', fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', transition: 'color 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}>
              [{devMode ? 'switch: recruiter' : 'switch: dev mode'}]
            </button>
          </div>
        </footer>

      </div>{/* /zIndex wrapper */}

      {/* ── MODALS ── */}
      {showResume && <ResumeModal onClose={() => setShowResume(false)} />}

      {/* ── UPGRADE 5: ⌘K Command Palette ── */}
      {showCmd && (
        <CommandPalette
          onClose={() => setShowCmd(false)}
          scrollTo={scrollTo}
          setShowResume={setShowResume}
          setDevMode={setDevMode}
          devMode={devMode}
        />
      )}
    </div>
  );
};

export default App;
