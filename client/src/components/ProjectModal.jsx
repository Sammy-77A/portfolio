import { useEffect } from 'react';

const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        
        <div className="modal-grid">
          <div className="modal-image-side">
            <div className="modal-bg-blur" style={{ backgroundImage: `url(${project.image})` }}></div>
            
            <div className={`mockup-container ${project.type}`}>
              {project.type === 'desktop' && (
                <div className="browser-bar">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              )}
              <img src={project.image} alt={project.title} className="modal-main-img" />
            </div>
          </div>
          
          <div className="modal-info-side">
            <h2 className="modal-title">{project.title}</h2>
            <p className="modal-subtitle">{project.subtitle}</p>
            
            <div className="modal-stack">
              {project.stack.map(s => <span key={s} className="stack-tag">{s}</span>)}
            </div>

            <div className="modal-section">
              <div className="modal-section-h">The Problem</div>
              <p>{project.problem}</p>
            </div>

            <div className="modal-section">
              <div className="modal-section-h">The Engineering Solution</div>
              <p>{project.solution}</p>
            </div>

            <div className="modal-section">
              <div className="modal-section-h">Key Technical Features</div>
              <ul className="modal-features">
                {project.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            <div className="modal-actions">
              <a href={project.link} target="_blank" rel="noreferrer" className="sbtn">View Implementation</a>
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer" className="sbtn outline">Source Code</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
