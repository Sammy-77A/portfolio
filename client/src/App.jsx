import { useEffect, useRef, useState, useCallback } from 'react';
import './index.css';
import socialConfig from './socialConfig';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [formStatus, setFormStatus] = useState('');
  const [theme, setTheme] = useState('dark');
  const rightScrollRef = useRef(null);

  // ── THEME INIT ──
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  }, [theme]);

  // ── SCROLL ACTIVE NAV ──
  const navScrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const rightCol = rightScrollRef.current;
    if (!rightCol) return;

    const isMobile = window.innerWidth <= 780;
    const sections = document.querySelectorAll('section[id]');
    const sectionIds = ['home','projects','experience','tools','blog','contact'];

    const handleScroll = () => {
      let current = '';
      if (isMobile) {
        // On mobile, use window scroll position
        sections.forEach(sec => {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= 100) current = sec.id;
        });
      } else {
        sections.forEach(sec => {
          if (rightCol.scrollTop >= sec.offsetTop - 80) current = sec.id;
        });
      }
      if (current) setActiveTab(current);
    };

    if (isMobile) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      rightCol.addEventListener('scroll', handleScroll);
      return () => rightCol.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // ── SCROLL REVEAL (mobile-aware) ──
  useEffect(() => {
    const isMobile = window.innerWidth <= 780;
    const revealEls = document.querySelectorAll('.reveal');
    const observerRoot = isMobile ? null : rightScrollRef.current;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { root: observerRoot, threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  // ── CONTACT FORM ──
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Sending...');
    
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      budget: e.target.budget.value,
      message: e.target.message.value
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormStatus('Message sent!');
        e.target.reset();
      } else {
        setFormStatus('Error sending message.');
      }
    } catch (error) {
      setFormStatus('Error sending message.');
    }
  };

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-pill">
          <a className={activeTab === 'home' ? 'active' : ''} onClick={() => navScrollTo('home')} title="Home">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>
          </a>
          <a className={activeTab === 'projects' ? 'active' : ''} onClick={() => navScrollTo('projects')} title="Projects">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </a>
          <a className={activeTab === 'experience' ? 'active' : ''} onClick={() => navScrollTo('experience')} title="Experience">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </a>
          <a className={activeTab === 'tools' ? 'active' : ''} onClick={() => navScrollTo('tools')} title="Tools">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
          </a>
          <a className={activeTab === 'blog' ? 'active' : ''} onClick={() => navScrollTo('blog')} title="Blog">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V9"/><path d="M18 2l4 4-8 8H10v-4l8-8z"/></svg>
          </a>
          <a className={activeTab === 'contact' ? 'active' : ''} onClick={() => navScrollTo('contact')} title="Contact">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>

          {/* THEME TOGGLE */}
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
          </button>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="layout">
        
        {/* ═══ FIXED LEFT CARD ═══ */}
        <div className="left-col">
          <div className="pcard">
            <div className="dring dring-tl"></div>
            <div className="dring dring-br"></div>
            <div className="pcard-inner">
              <div className="pcard-photo">
                <img src="samuel.jpeg" alt="Samuel Ndubi"/>
              </div>
              <div className="pcard-body">
                <div className="pcard-name">Samuel Ndubi</div>
                <div className="fire-dot">🔥</div>
                <p className="pcard-bio">Backend &amp; fintech developer based in Nairobi, Kenya. Building reliable systems and payment integrations that work.</p>
                <div className="socials">
                  <a href={socialConfig.github} target="_blank" rel="noreferrer" title="GitHub">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </a>
                  <a href={socialConfig.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href={socialConfig.twitter} target="_blank" rel="noreferrer" title="X (Twitter)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href={socialConfig.instagram} target="_blank" rel="noreferrer" title="Instagram">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href={socialConfig.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SCROLLABLE RIGHT ═══ */}
        <div className="right-col" id="rightScroll" ref={rightScrollRef}>
          
          {/* 1. HOME / HERO */}
          <section id="home">
            <h1 className="hl reveal">
              <span className="s">SOFTWARE</span>
              <span className="g">DEVELOPER</span>
            </h1>
            <p className="hero-desc reveal">Backend &amp; fintech developer based in Nairobi, Kenya. I build payment integrations, APIs, and scalable systems — with a focus on getting things working reliably in the real world.</p>
            <div className="stats reveal">
              <div>
                <div className="stat-n">+2</div>
                <div className="stat-l">Years of<br/>Experience</div>
              </div>
              <div>
                <div className="stat-n">8+</div>
                <div className="stat-l">GitHub<br/>Repos</div>
              </div>
              <div>
                <div className="stat-n">3+</div>
                <div className="stat-l">Projects<br/>Shipped</div>
              </div>
            </div>

            <div className="skills-grid reveal" style={{ marginTop: '60px' }}>
              <div className="skill-card orange">
                <div className="skill-tag">Primary</div>
                <div style={{ fontSize: '36px' }}>⬡</div>
                <div className="skill-name">Backend Dev</div>
              </div>
              <div className="skill-card lime">
                <div className="skill-tag" style={{ color: '#444' }}>Fintech</div>
                <div style={{ fontSize: '36px', color: '#111' }}>▦</div>
                <div className="skill-name" style={{ color: '#111' }}>M-Pesa Daraja</div>
              </div>
              <div className="skill-card dark">
                <div className="skill-tag">Language</div>
                <div style={{ fontSize: '36px' }}>◈</div>
                <div className="skill-name">PHP &amp; Java</div>
              </div>
              <div className="skill-card dark2">
                <div className="skill-tag">Frontend</div>
                <div style={{ fontSize: '36px' }}>⚛</div>
                <div className="skill-name">React &amp; Node.js</div>
              </div>
            </div>
          </section>

          {/* 2. RECENT PROJECTS */}
          <section id="projects">
            <div className="sec-h reveal from-left">
              <span className="s">RECENT</span>
              <span className="g">PROJECTS</span>
            </div>
            <div className="projects-list reveal">
              <div className="proj-item">
                <div className="proj-thumb" style={{ background: 'linear-gradient(135deg,#1a6b3a,#0a3d1f)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💸</div>
                </div>
                <div>
                  <div className="proj-title">M-Pesa Daraja Integration</div>
                  <div className="proj-sub">Production-ready PHP fintech toolkit — C2B, B2C &amp; STK Push</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb" style={{ background: 'linear-gradient(135deg,#5b21b6,#1e1b4b)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🧠</div>
                </div>
                <div>
                  <div className="proj-title">MindMate</div>
                  <div className="proj-sub">Android mental wellness app built with Java &amp; Firebase</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb" style={{ background: 'linear-gradient(135deg,#1e40af,#0f172a)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💼</div>
                </div>
                <div>
                  <div className="proj-title">Jeramoyie</div>
                  <div className="proj-sub">Client freelance project — PHP web application</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb" style={{ background: 'linear-gradient(135deg,#0d9488,#064e3b)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🌐</div>
                </div>
                <div>
                  <div className="proj-title">Portfolio Site (React)</div>
                  <div className="proj-sub">This site — rebuilt with React, Vite &amp; Express.js backend</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
            </div>
          </section>

          {/* 3. EXPERIENCE */}
          <section id="experience">
            <div className="sec-h reveal from-left">
              <span className="s">2 YEARS OF</span>
              <span className="g">EXPERIENCE</span>
            </div>
            <div className="exp-list reveal">
              <div className="exp-item">
                <div>
                  <div className="exp-company">Freelance — Independent Developer</div>
                  <p className="exp-desc">Building client web applications and fintech integrations, including M-Pesa Daraja API implementations, custom PHP backends, and modern React frontends with Node.js/Express backends for businesses in Kenya.</p>
                  <div className="exp-date">2023 – Present</div>
                </div>
                <a href="#" className="arr">↗</a>
              </div>
              <div className="exp-item">
                <div>
                  <div className="exp-company">Personal Projects &amp; Open Source</div>
                  <p className="exp-desc">Developed MindMate (Android mental health app with Firebase), rebuilt my portfolio using React + Vite with a Node.js/Express backend, and various backend tools. Maintaining 8+ public repositories on GitHub focused on practical, real-world solutions.</p>
                  <div className="exp-date">2022 – Present</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
            </div>
          </section>

          {/* 4. TOOLS */}
          <section id="tools">
            <div className="sec-h reveal from-left">
              <span className="s">MY TECH</span>
              <span className="g">STACK</span>
            </div>
            <div className="tools-grid reveal">
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#4F5B93' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><text x="3" y="17" fontSize="11" fill="white" fontWeight="bold" fontFamily="sans-serif">PHP</text></svg>
                </div>
                <div>
                  <div className="tool-name">PHP</div>
                  <div className="tool-role">Primary Language</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#b07219' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><text x="1" y="17" fontSize="9" fill="white" fontWeight="bold" fontFamily="sans-serif">Java</text></svg>
                </div>
                <div>
                  <div className="tool-name">Java</div>
                  <div className="tool-role">Android &amp; Backend</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#61DAFB' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#111"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#111" strokeWidth="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#111" strokeWidth="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#111" strokeWidth="1.2" transform="rotate(120 12 12)"/></svg>
                </div>
                <div>
                  <div className="tool-name">React</div>
                  <div className="tool-role">Frontend Framework</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#339933' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M11.998 24c-.321 0-.639-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339a.29.29 0 00.272 0l8.795-5.076a.277.277 0 00.134-.238V6.921a.28.28 0 00-.137-.242l-8.791-5.072a.278.278 0 00-.271 0L3.075 6.68a.28.28 0 00-.138.24v10.15c0 .099.053.19.138.236l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675a1.857 1.857 0 01-.922-1.604V6.921c0-.659.353-1.275.922-1.603L11.076.242a1.925 1.925 0 011.846 0l8.794 5.076c.569.329.924.944.924 1.603v10.15c0 .659-.355 1.273-.924 1.604l-8.794 5.076a1.847 1.847 0 01-.924.249z"/></svg>
                </div>
                <div>
                  <div className="tool-name">Node.js</div>
                  <div className="tool-role">Runtime &amp; Express</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#00758f' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><text x="0" y="17" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">SQL</text></svg>
                </div>
                <div>
                  <div className="tool-name">MySQL</div>
                  <div className="tool-role">Database</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#FFCA28' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#111"><path d="M3.89 15.672L6.255.461A.542.542 0 017.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z"/></svg>
                </div>
                <div>
                  <div className="tool-name">Firebase</div>
                  <div className="tool-role">Backend &amp; Auth</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#1a1a1a' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </div>
                <div>
                  <div className="tool-name">GitHub</div>
                  <div className="tool-role">Version Control</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#006600' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
                </div>
                <div>
                  <div className="tool-name">M-Pesa Daraja</div>
                  <div className="tool-role">Payments API</div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. BLOG */}
          <section id="blog">
            <div className="sec-h reveal from-left">
              <span className="s">DEV</span>
              <span className="g">NOTES</span>
            </div>
            <div className="blog-list reveal">
              <div className="blog-item">
                <div>
                  <div className="blog-title">Integrating M-Pesa STK Push in PHP</div>
                  <div className="blog-exc">A walkthrough of how to implement M-Pesa STK Push using the Daraja API — handling callbacks, validating transactions, and building a reliable payment flow for Kenyan businesses.</div>
                  <div className="blog-meta"><span>Coming soon</span><span>Dev write-up</span></div>
                </div>
                <a href="#" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">Building MindMate — A Mental Wellness App in Java</div>
                  <div className="blog-exc">How I designed and built a mental health companion app for Android using Java, Firebase authentication, and Firestore as the real-time backend database.</div>
                  <div className="blog-meta"><span>Coming soon</span><span>Project breakdown</span></div>
                </div>
                <a href="#" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">Why I Focus on Backend &amp; Fintech</div>
                  <div className="blog-exc">My journey into backend development and why fintech — especially mobile money integrations — is one of the most impactful areas to work in as a developer in Kenya.</div>
                  <div className="blog-meta"><span>Coming soon</span><span>Personal</span></div>
                </div>
                <a href="#" className="arr">↗</a>
              </div>
            </div>
          </section>

          {/* 6. CONTACT */}
          <section id="contact">
            <div className="sec-h reveal from-left">
              <span className="s">LET'S WORK</span>
              <span className="g">TOGETHER</span>
            </div>
            <form className="cform reveal" onSubmit={handleContactSubmit}>
              <div className="f"><label>Name</label><input type="text" name="name" required placeholder="Your Name"/></div>
              <div className="f"><label>Email</label><input type="email" name="email" required placeholder="Your@email.com"/></div>
              <div className="f full">
                <label>Budget</label>
                <select name="budget" defaultValue="" required>
                  <option value="" disabled>Select...</option>
                  <option value="Under $1,000">Under $1,000</option>
                  <option value="$1,000 – $5,000">$1,000 – $5,000</option>
                  <option value="$5,000 – $10,000">$5,000 – $10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </select>
              </div>
              <div className="f full"><label>Message</label><textarea name="message" required placeholder="Message"></textarea></div>
              <button type="submit" className="sbtn">Submit</button>
              {formStatus && <div style={{gridColumn: '1/-1', textAlign: 'center', fontSize: '13px', color: '#ff6930', marginTop: '10px'}}>{formStatus}</div>}
            </form>
          </section>

        </div>{/* /right-col */}
      </div>{/* /layout */}
    </>
  );
}

export default App;
