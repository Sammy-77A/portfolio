import { useState, useEffect, useRef } from 'react';

const DarajaPlayground = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('1');
  const [status, setStatus] = useState('idle'); // idle, initiating, pushing, success, error
  const [stkLogs, setStkLogs] = useState([]);
  const [jsonResult, setJsonResult] = useState(null);
  const logsContainerRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStkLogs(prev => [...prev, { time, msg, type }]);
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTo({
        top: logsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [stkLogs]);

  const resetPlayground = () => {
    setStatus('idle');
    setStkLogs([]);
    setJsonResult(null);
  };

  const validatePhoneNumber = (num) => {
    // Kenyan formats: 2547XXXXXXXX, 2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, 1XXXXXXXX
    const regex = /^(?:254|\+254|0)?([17]\d{8})$/;
    return regex.test(num);
  };

  const formatPhoneNumber = (num) => {
    // Only allow digits and limit to 12 chars (254...)
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
    return cleaned;
  };

  const simulateSTKPush = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;

    if (!validatePhoneNumber(phoneNumber)) {
      setStatus('error');
      addLog('Error: Invalid Phone Number format. Use 2547XXXXXXXX or 07XXXXXXXX', 'error');
      return;
    }

    setStatus('initiating');
    setStkLogs([]);
    setJsonResult(null);

    addLog('POST /oauth/v1/generate?grant_type=client_credentials', 'command');
    await new Promise(r => setTimeout(r, 800));
    addLog('Status: 200 OK - Access Token Generated', 'success');
    
    await new Promise(r => setTimeout(r, 600));
    addLog(`POST /mpesa/stkpush/v1/processrequest`, 'command');
    addLog(`{ "BusinessShortCode": "174379", "Amount": "${amount}", "PhoneNumber": "${phoneNumber}" }`, 'json');
    
    await new Promise(r => setTimeout(r, 1000));
    setStatus('pushing');
    addLog('STK Push Request Sent to Safaricom...', 'info');
    addLog('Waiting for User Input on Mobile Device...', 'warning');

    // Simulate the user "paying" on the virtual phone
    await new Promise(r => setTimeout(r, 3500));
    
    setStatus('success');
    addLog('Callback Received from Daraja API', 'success');
    addLog('Transaction Completed Successfully', 'success');

    setJsonResult({
      MerchantRequestID: "29115-34556-1",
      CheckoutRequestID: "ws_CO_26032024102035405",
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Request accepted for processing"
    });
  };

  return (
    <div className="daraja-playground reveal">
      <div className="playground-header">
        <div className="dot red"></div>
        <div className="dot yellow"></div>
        <div className="dot green"></div>
        <span className="title">DARAJA API PLAYGROUND</span>
      </div>

      <div className="playground-content">
        {/* LEFT: TERMINAL / INPUT */}
        <div className="terminal-section">
          {status === 'idle' ? (
            <form onSubmit={simulateSTKPush} className="terminal-form">
              <div className="input-group">
                <span className="prompt">$</span>
                <input 
                  type="text" 
                  placeholder="2547XXXXXXXX" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  required
                />
              </div>
              <div className="input-group">
                <span className="prompt">$</span>
                <input 
                  type="number" 
                  placeholder="Amount (KES)" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="terminal-btn">EXECUTE STK_PUSH</button>
            </form>
          ) : (
            <div className="terminal-logs" ref={logsContainerRef}>
              {stkLogs.map((log, i) => (
                <div key={i} className={`log-line ${log.type}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-msg">{log.msg}</span>
                </div>
              ))}
              {status === 'success' || stkLogs.some(l => l.type === 'error') ? (
                <button onClick={resetPlayground} className="terminal-btn secondary">RESET SYSTEM</button>
              ) : null}
            </div>
          )}
        </div>

        {/* RIGHT: VIRTUAL PHONE / JSON */}
        <div className="visual-section">
          {status === 'pushing' ? (
            <div className="phone-wrapper">
              <div className="smartphone">
                <div className="screen">
                  <div className="stk-prompt">
                    <img src="/daraja.svg" alt="M-Pesa" className="stk-logo"/>
                    <div className="stk-title">SIM Toolkit</div>
                    <p className="stk-msg">Do you want to pay KES {amount} to SAMUEL BUILDS?</p>
                    <div className="stk-actions">
                      <div className="stk-btn cancel">Cancel</div>
                      <div className="stk-btn ok">OK</div>
                    </div>
                    <div className="stk-pin">
                      {[1,2,3,4].map(i => <div key={i} className="pin-dot"></div>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="vibration-layer"></div>
            </div>
          ) : jsonResult ? (
            <div className="json-container">
              <div className="json-header">RESULT.JSON</div>
              <pre className="json-body">
                {JSON.stringify(jsonResult, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="idle-visual">
              <div className="orb"></div>
              <p>System Ready for Instruction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DarajaPlayground;
