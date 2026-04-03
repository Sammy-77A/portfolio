const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Manual Security Headers
app.use((req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// 2. CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://samuelbuilds.top', 'https://www.samuelbuilds.top']
    : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// 3. Simple In-Memory Rate Limiting
const rateLimiter = {};
const contactLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimiter[ip]) {
    rateLimiter[ip] = { count: 1, firstRequest: now };
  } else {
    if (now - rateLimiter[ip].firstRequest > 3600000) {
      rateLimiter[ip] = { count: 1, firstRequest: now };
    } else {
      rateLimiter[ip].count += 1;
    }
  }
  if (rateLimiter[ip].count > 5) {
    return res.status(429).json({ 
      error: 'RATE_LIMIT_EXCEEDED', 
      message: 'Too many requests. Our system is taking a quick coffee break. Please wait a few moments.' 
    });
  }
  next();
};

// ============================================================
// RESEND API INTEGRATION
// ============================================================
const resendApiKey = process.env.RESEND_API_KEY;
const contactEmail = process.env.CONTACT_EMAIL || 'samuendubi321@gmail.com';

function sendResendEmail(options) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: 'Samuel Ndubi <hello@samuelbuilds.top>', // Domain now verified!
      to: options.to,
      subject: options.subject,
      text: options.text,
      reply_to: options.replyTo,
      bcc: options.bcc
    });

    const reqOptions = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Resend API refused (Status ${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// ============================================================
// DIAGNOSTIC ENDPOINT
// ============================================================
app.get('/api/test-resend', async (req, res) => {
  try {
    const result = await sendResendEmail({
      to: contactEmail,
      subject: 'Resend Diagnostic Test',
      text: 'If you receive this in Your Gmail, the new Resend integration is working!'
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// ERROR TEST ENDPOINTS
// ============================================================
app.get('/api/error-500', (req, res) => {
  throw new Error('This is a simulated internal server error.');
});

app.get('/api/error-429', (req, res) => {
  res.status(429).json({ 
    error: 'RATE_LIMIT_EXCEEDED', 
    message: 'Artificial rate limit triggered for testing.' 
  });
});

// ============================================================
// CONTACT FORM HANDLER
// ============================================================
const handleContact = async (req, res) => {
  let { name, email, budget, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (!message || message.trim().length < 2) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  name = name.trim();
  email = email.trim().toLowerCase();
  budget = budget.trim() || 'Not specified';
  message = message.trim();

  try {
    console.log(`Processing contact inquiry via Resend: ${email}`);

    // Notification to Samuel
    const mainMail = await sendResendEmail({
      to: contactEmail,
      subject: `New Portfolio Inquiry - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nBudget: ${budget}\n\nMessage:\n${message}\n\n---\nNote: This email was securely routed via the Resend API.`
    });

    // Auto-reply (Non-fatal)
    try {
      await sendResendEmail({
        to: email,
        subject: `Message Received - Samuel Ndubi`,
        text: `Hi ${name},\n\nThank you for reaching out! I've received your inquiry from my portfolio and will get back to you soon.\n\nBest regards,\nSamuel Ndubi\nhttps://samuelbuilds.top/`
      });
    } catch (autoErr) {
      console.warn("Auto-reply skipped:", autoErr.message);
    }

    res.status(200).json({ success: true, messageId: mainMail.id });
  } catch (error) {
    console.error("Resend delivery failure:", error);
    res.status(500).json({
      error: 'Delivery failure. The message was accepted but could not be forwarded.',
      status: 'API_ERROR',
      message: error.message
    });
  }
};

app.post('/api/contact', contactLimit, handleContact);
app.post('/contact', contactLimit, handleContact);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'online', resend_ready: !!resendApiKey }));
app.get('/health', (req, res) => res.json({ status: 'online' }));

app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ 
    error: 'SYSTEM_FAILURE', 
    message: 'Internal loop failure detected. Wires might be crossed in the backend logic.' 
  });
});

// 404 Catch-all
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API_NOT_FOUND', message: 'The requested API endpoint does not exist.' });
  } else {
    // For browser requests, we should ideally serve the React app and let it handle 404
    // But on shared hosting, a simple fallback is safer
    res.status(404).send('<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p><a href="/">Go Home</a>');
  }
});

app.listen(PORT, () => {
  console.log(`Resend-powered server running on port ${PORT}`);
});
