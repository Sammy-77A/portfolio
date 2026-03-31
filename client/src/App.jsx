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
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"/></svg>
                </div>
                <div>
                  <div className="tool-name">PHP</div>
                  <div className="tool-role">Primary Language</div>
                </div>
              </div>
              <div className="tool-item">
                <div className="tool-icon" style={{ background: '#fdfdfd' }}>
                  <svg width="28" height="28" viewBox="0 0 128 128">
                    <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"/>
                    <path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"/>
                    <path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"/>
                    <path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"/>
                    <path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"/>
                  </svg>
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
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 00-.27-4.41h-.008l-1.41 4.41H2.45l-1.4 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 00-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.064h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.877.615 1.583.615.264 0 .506-.033.725-.098l1.325.772.36-.622zM15.5 17.588c-.225-.36-.337-.94-.337-1.736 0-1.393.424-2.09 1.27-2.09.443 0 .77.167.977.5.224.362.336.936.336 1.723 0 1.404-.424 2.108-1.27 2.108-.445 0-.77-.167-.978-.5zm-1.658-.425c0 .47-.172.856-.516 1.156-.344.3-.803.45-1.384.45-.543 0-1.064-.172-1.573-.515l.237-.476c.438.22.833.328 1.19.328.332 0 .593-.073.783-.22a.754.754 0 00.3-.615c0-.33-.23-.61-.648-.845-.388-.213-1.163-.657-1.163-.657-.422-.307-.632-.636-.632-1.177 0-.45.157-.81.47-1.085.315-.278.72-.415 1.22-.415.512 0 .98.136 1.4.41l-.213.476a2.726 2.726 0 00-1.064-.23c-.283 0-.502.068-.654.206a.685.685 0 00-.248.524c0 .328.234.61.666.85.393.215 1.187.67 1.187.67.433.305.648.63.648 1.168zm9.382-5.852c-.535-.014-.95.04-1.297.188-.1.04-.26.04-.274.167.055.053.063.14.11.214.08.134.218.313.346.407.14.11.28.216.427.31.26.16.555.255.81.416.145.094.293.213.44.313.073.05.12.14.214.172v-.02c-.046-.06-.06-.147-.105-.214-.067-.067-.134-.127-.2-.193a3.223 3.223 0 00-.695-.675c-.214-.146-.682-.35-.77-.595l-.013-.014c.146-.013.32-.066.46-.106.227-.06.435-.047.67-.106.106-.027.213-.06.32-.094v-.06c-.12-.12-.21-.283-.334-.395a8.867 8.867 0 00-1.104-.823c-.21-.134-.476-.22-.697-.334-.08-.04-.214-.06-.26-.127-.12-.146-.19-.34-.275-.514a17.69 17.69 0 01-.547-1.163c-.12-.262-.193-.523-.34-.763-.69-1.137-1.437-1.826-2.586-2.5-.247-.14-.543-.2-.856-.274-.167-.008-.334-.02-.5-.027-.11-.047-.216-.174-.31-.235-.38-.24-1.364-.76-1.644-.072-.18.434.267.862.422 1.082.115.153.26.328.34.5.047.116.06.235.107.356.106.294.207.622.347.897.073.14.153.287.247.413.054.073.146.107.167.227-.094.136-.1.334-.154.5-.24.757-.146 1.693.194 2.25.107.166.362.534.703.393.3-.12.234-.5.32-.835.02-.08.007-.133.048-.187v.015c.094.188.188.367.274.555.206.328.566.668.867.895.16.12.287.328.487.402v-.02h-.015c-.043-.058-.1-.086-.154-.133a3.445 3.445 0 01-.35-.4 8.76 8.76 0 01-.747-12.18c-.11-.21-.202-.436-.29-.643-.04-.08-.04-.2-.107-.24-.1.146-.247.273-.32.453-.127.288-.14.642-.188 1.01-.027.007-.014 0-.027.014-.214-.052-.287-.274-.367-.46-.2-.475-.233-1.238-.06-1.785.047-.14.247-.582.167-.716-.042-.127-.174-.2-.247-.303a2.478 2.478 0 01-.24-.427c-.16-.374-.24-.788-.414-1.162-.08-.173-.22-.354-.334-.513-.127-.18-.267-.307-.368-.52-.033-.073-.08-.194-.027-.274.014-.054.042-.075.094-.09.088-.072.335.022.422.062.247.1.455.194.662.334.094.066.195.193.315.226h.14c.214.047.455.014.655.073.355.114.675.28.962.46a5.953 5.953 0 012.085 2.286c.08.154.115.295.188.455.14.33.313.663.455.982.14.315.275.636.476.897.1.14.502.213.682.286.133.06.34.115.46.188.23.14.454.3.67.454.11.076.443.243.463.378z"/></svg>
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
                <div className="tool-icon" style={{ background: '#ffffff' }}>
                  <svg width="34" height="24" viewBox="0 0 100 34" xmlns="http://www.w3.org/2000/svg">
                    <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '900', fontSize: '24px', letterSpacing: '-1.5px' }}>
                      <tspan fill="#e31937">{'{'}</tspan>
                      <tspan fill="#008b45">daraja</tspan>
                      <tspan fill="#e31937">{'}'}</tspan>
                    </text>
                  </svg>
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
