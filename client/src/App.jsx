import { useEffect, useRef, useState, useCallback } from 'react';
import './index.css';
import socialConfig from './socialConfig';
import DarajaPlayground from './components/DarajaPlayground';
import ErrorView from './components/ErrorView';
import Cursor from './components/Cursor';
import techStack from './techStackData';

const TYPEWRITER_WORDS = ['Backend Developer', 'Fintech Engineer', 'API Specialist', 'System Architect'];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [formStatus, setFormStatus] = useState(''); // '', 'sending', 'success', 'error'
  const [formMessage, setFormMessage] = useState('');
  const [theme, setTheme] = useState('dark');
  const [errorState, setErrorState] = useState(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [techFilter, setTechFilter] = useState('All');
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

  // ── APP LOADED (remove skeleton) ──
  useEffect(() => {
    setIsAppLoaded(true);
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 400);
    }
  }, []);

  // ── TYPEWRITER ──
  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[wordIndex];
    let timeout;

    if (!isDeleting && typewriterText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typewriterText === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
    } else {
      timeout = setTimeout(() => {
        setTypewriterText(prev =>
          isDeleting ? prev.slice(0, -1) : currentWord.slice(0, prev.length + 1)
        );
      }, isDeleting ? 40 : 80);
    }

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, wordIndex]);

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
    
    const handleScroll = () => {
      let current = '';
      if (isMobile) {
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

  // ── SCROLL REVEAL ──
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
  }, [errorState, techFilter, activeTab]);

  // ── TOAST AUTO-DISMISS ──
  useEffect(() => {
    if (formStatus === 'success' || formStatus === 'error') {
      const timer = setTimeout(() => {
        setFormStatus('');
        setFormMessage('');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  // ── CONTACT FORM ──
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormMessage('');
    
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
        setFormStatus('success');
        setFormMessage('Message sent successfully!');
        e.target.reset();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormStatus('error');
        setFormMessage(errorData.details || errorData.error || 'Failed to send message');
      }
    } catch (error) {
      setFormStatus('error');
      setFormMessage(`Connection failed: ${error.message}`);
    }
  };

  if (errorState) {
    return <ErrorView 
      code={errorState.code} 
      message={errorState.message} 
      onHome={() => setErrorState(null)} 
      onRetry={() => setErrorState(null)}
    />;
  }

  return (
    <>
      <Cursor />
      {/* NAV */}
      <nav>
        <div className="nav-pill">
          <a className={activeTab === 'home' ? 'active' : ''} onClick={() => navScrollTo('home')} title="Home">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>
          </a>
          <a className={activeTab === 'projects' ? 'active' : ''} onClick={() => navScrollTo('projects')} title="Projects">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </a>
          <a className={activeTab === 'playground' ? 'active' : ''} onClick={() => navScrollTo('playground')} title="API Playground">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" transform="rotate(90 12 10)"/><path d="M8 10h8m-8 4h4"/></svg>
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
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
          </button>
        </div>
      </nav>

      <div className="layout">
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

        <div className="right-col" id="rightScroll" ref={rightScrollRef}>
          <section id="home">
            <h1 className="hl reveal">
              <span className="s">SOFTWARE</span>
              <span className="g">DEVELOPER</span>
            </h1>
            <div className="typewriter-line reveal">
              <span className="typewriter-prefix">I am a </span>
              <span className="typewriter-text">{typewriterText}</span>
              <span className="typewriter-cursor">|</span>
            </div>
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
                <div className="stat-n">4+</div>
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

          <section id="projects">
            <div className="sec-h reveal from-left">
              <span className="s">RECENT</span>
              <span className="g">PROJECTS</span>
            </div>
            <div className="projects-list reveal">
              <div className="proj-item">
                <div className="proj-thumb">
                  <img src="/kwikihost.webp" alt="KwikiHost Screenshot" />
                </div>
                <div>
                  <div className="proj-title">KwikiHost</div>
                  <div className="proj-sub">SaaS web hosting reseller platform — Laravel 12 &amp; M-Pesa</div>
                </div>
                <a href="https://kwikihost.top" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb">
                  <img src="/jeramoyie.webp" alt="Jeramoyie App Screenshot" />
                </div>
                <div>
                  <div className="proj-title">Jeramoyie Financial System</div>
                  <div className="proj-sub">Comprehensive microfinance ledger, auditing, and accounting platform</div>
                </div>
                <a href="https://jeramy1.top" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb">
                  <img src="/daraja-thumb.webp" alt="M-Pesa Daraja Code Output" />
                </div>
                <div>
                  <div className="proj-title">M-Pesa Daraja Integration</div>
                  <div className="proj-sub">Production-ready PHP fintech toolkit — C2B, B2C &amp; STK Push</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="proj-item">
                <div className="proj-thumb">
                  <img src="/mindmate.webp" alt="MindMate Application Screenshot" />
                </div>
                <div>
                  <div className="proj-title">MindMate</div>
                  <div className="proj-sub">Android mental wellness app built with Java &amp; Firebase</div>
                </div>
                <a href={socialConfig.github} target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
            </div>
          </section>

          <section id="playground">
            <div className="sec-h reveal from-right">
              <span className="s">API</span>
              <span className="g">PLAYGROUND</span>
            </div>
            <div className="live-status reveal">
              <span className="status-dot"></span> 
              <span>Live Safaricom API Connection</span>
            </div>
            <p className="hero-desc reveal" style={{ marginBottom: '30px' }}>Experience a live simulation of my M-Pesa Daraja integration logic. Test the STK push flow and see how the backend communicates with the Safaricom API.</p>
            <DarajaPlayground setError={setErrorState} />
          </section>

          <section id="experience">
            <div className="sec-h reveal from-left">
              <span className="s">2 YEARS OF</span>
              <span className="g">EXPERIENCE</span>
            </div>
            <div className="exp-list reveal">
              <div className="exp-item">
                <div>
                  <div className="exp-company">Freelance &amp; SaaS Founder</div>
                  <p className="exp-desc">Built and launched KwikiHost (SaaS hosting reseller platform). Handling client web applications and fintech integrations, including M-Pesa Daraja API implementations, custom PHP backends, and modern React frontends for businesses in Kenya.</p>
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

          <section id="tools">
            <div className="sec-h reveal from-left">
              <span className="s">MY TECH</span>
              <span className="g">STACK</span>
            </div>

            <div className="filter-tabs reveal">
              {['All', 'Backend', 'Frontend', 'Mobile', 'Database', 'Tools'].map(cat => (
                <button 
                  key={cat} 
                  className={`filter-btn ${techFilter === cat ? 'active' : ''}`}
                  onClick={() => setTechFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="tools-grid">
              {techStack
                .filter(t => techFilter === 'All' || t.category === techFilter)
                .map((tool, i) => (
                <div className={`tool-item reveal stagger-${(i % 4) + 1}`} key={tool.name}>
                  <div className="tool-icon" style={{ background: `${tool.color}1a` }}>
                    <svg width="22" height="22" viewBox={tool.viewBox || "0 0 24 24"} fill={tool.color}>
                      {tool.paths ? (
                        tool.paths.map((p, i) => (
                          <path key={i} fill={p.fill || "currentColor"} fillRule={p.fillRule} clipRule={p.clipRule} d={p.d} />
                        ))
                      ) : (
                        <path d={tool.path}/>
                      )}
                    </svg>
                  </div>
                  <div>
                    <div className="tool-name">{tool.name}</div>
                    <div className="tool-role">{tool.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="blog">
            <div className="sec-h reveal from-left">
              <span className="s">DEV</span>
              <span className="g">NOTES</span>
            </div>
            <div className="blog-list reveal">
              <div className="blog-item">
                <div>
                  <div className="blog-title">Building KwikiHost — From Idea to Launched SaaS</div>
                  <div className="blog-exc">A deep dive into building a web hosting reseller business from scratch — from Laravel backend architecture to automated M-Pesa fulfillment systems.</div>
                  <div className="blog-meta"><span>Live Site</span><span>Case study</span></div>
                </div>
                <a href="https://kwikihost.top" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">Jeramoyie Financial System</div>
                  <div className="blog-exc">A comprehensive microfinance ledger and management platform with robust auditing and accounting features.</div>
                  <div className="blog-meta"><span>Live Site</span><span>Fintech</span></div>
                </div>
                <a href="https://jeramy1.top" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">M-Pesa Daraja Integration toolkit</div>
                  <div className="blog-exc">Production-ready PHP toolkit implementing Safaricom's M-Pesa Daraja API for B2C, C2B, and STK Push transactions.</div>
                  <div className="blog-meta"><span>Open Source</span><span>PHP</span></div>
                </div>
                <a href="https://github.com/Sammy-77A/MPESA-INTERGRATIONS-PHP" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">MindMate — Mental Wellness App</div>
                  <div className="blog-exc">Android application designed for mental health tracking with Firebase backend support.</div>
                  <div className="blog-meta"><span>Open Source</span><span>Java/Android</span></div>
                </div>
                <a href="https://github.com/Sammy-77A/MindMate" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
              <div className="blog-item">
                <div>
                  <div className="blog-title">MyTicket Event Booking System</div>
                  <div className="blog-exc">Comprehensive digital ticketing backend and desktop dashboard with complex seat management and API workflows.</div>
                  <div className="blog-meta"><span>Open Source</span><span>Java/Spring</span></div>
                </div>
                <a href="https://github.com/Sammy-77A/Myticketproject" target="_blank" rel="noreferrer" className="arr">↗</a>
              </div>
            </div>
          </section>

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
                  <option value="Under KES 50,000">Under KES 50,000</option>
                  <option value="KES 50,000 – KES 150,000">KES 50,000 – KES 150,000</option>
                  <option value="KES 150,000 – KES 500,000">KES 150,000 – KES 500,000</option>
                  <option value="KES 500,000+">KES 500,000+</option>
                </select>
              </div>
              <div className="f full"><label>Message</label><textarea name="message" required placeholder="Message"></textarea></div>
              <button type="submit" className="sbtn" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {(formStatus === 'success' || formStatus === 'error') && (
        <div className={`toast toast-${formStatus}`}>
          <div className="toast-icon">
            {formStatus === 'success' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
          </div>
          <div className="toast-body">
            <div className="toast-title">{formStatus === 'success' ? 'Success' : 'Error'}</div>
            <div className="toast-msg">{formMessage}</div>
          </div>
          <button className="toast-close" onClick={() => { setFormStatus(''); setFormMessage(''); }}>✕</button>
        </div>
      )}
    </>
  );
}

export default App;
