import { useState } from 'react';

const ErrorView = ({ code, message, onRetry, onHome }) => {
  const errorData = {
    '404': {
      title: 'PAGE_NOT_FOUND',
      msg: "The path you are looking for has been moved or doesn't exist. Let's get you back on track.",
      btnText: 'Return to Hub',
      icon: '🛰️',
      color: '#ff2d20'
    },
    '500': {
      title: 'SYSTEM_FAILURE',
      msg: 'Internal loop failure detected. Wires might be crossed in the backend logic. Manual reboot required.',
      btnText: 'Attempt Reboot',
      icon: '🔥',
      color: '#b91c1c'
    },
    '429': {
      title: 'RATE_LIMIT_EXCEEDED',
      msg: 'Too many requests. Our system is taking a quick coffee break. Please wait a few moments.',
      btnText: 'Wait it Out',
      icon: '☕',
      color: '#ff6930'
    }
  };

  const current = errorData[code] || errorData['404'];

  return (
    <div className="error-overlay">
      <div className="error-card reveal visible">
        <div className="error-icon" style={{ borderColor: current.color }}>
          <span className="icon-main">{current.icon}</span>
        </div>
        <div className="error-code" style={{ color: current.color }}>[ERROR_{code}]</div>
        <h1 className="error-title">{current.title}</h1>
        <p className="error-msg">{message || current.msg}</p>
        
        <div className="error-actions">
          {onRetry && (
            <button className="error-btn retry" onClick={onRetry}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Retry
            </button>
          )}
          <button className="error-btn home" onClick={onHome || (() => window.location.href = '/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {current.btnText}
          </button>
          {code === '500' && (
            <a href="mailto:nds.samuel@gmail.com?subject=System%20Failure%20Report&body=I%20encountered%20a%20500%20System%20Failure%20at%20samuelbuilds.top." className="error-btn retry" style={{ textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Report Issue
            </a>
          )}
        </div>

        <div className="error-footer">
          <div className="glitch-line"></div>
          <span>Reported by System Sentinel</span>
        </div>
      </div>
      
      <div className="bg-glitch"></div>
    </div>
  );
};

export default ErrorView;
