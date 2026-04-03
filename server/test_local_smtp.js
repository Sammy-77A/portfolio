// Quick diagnostic: replicate the exact email that /api/test-send sent (which WORKED)
// vs the email /api/contact sends (which FAILS)
// Run this on the server as a diagnostic endpoint

const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpUser = process.env.SMTP_USER || 'hello@samuelbuilds.top';
const smtpPass = process.env.SMTP_PASS;
const contactEmail = process.env.CONTACT_EMAIL || smtpUser;

async function test() {
  const t = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false }
  });

  // Test 1: Simple (this worked in /api/test-send)
  try {
    const r1 = await t.sendMail({
      from: smtpUser,
      to: contactEmail,
      subject: 'Test 1 - Simple',
      text: 'Simple test'
    });
    console.log('Test 1 PASSED:', r1.messageId);
  } catch (e) {
    console.log('Test 1 FAILED:', e.code, e.message);
  }

  // Test 2: With replyTo (the contact form uses this)
  try {
    const r2 = await t.sendMail({
      from: smtpUser,
      to: contactEmail,
      replyTo: 'samuendubi321@gmail.com',
      subject: 'Test 2 - With ReplyTo',
      text: 'Test with replyTo header'
    });
    console.log('Test 2 PASSED:', r2.messageId);
  } catch (e) {
    console.log('Test 2 FAILED:', e.code, e.message);
  }

  // Test 3: Sending TO gmail (the auto-reply does this)
  try {
    const r3 = await t.sendMail({
      from: smtpUser,
      to: 'samuendubi321@gmail.com',
      subject: 'Test 3 - To Gmail',
      text: 'Test sending to external gmail'
    });
    console.log('Test 3 PASSED:', r3.messageId);
  } catch (e) {
    console.log('Test 3 FAILED:', e.code, e.message);
  }

  // Test 4: Sending to self (hello@samuelbuilds.top -> hello@samuelbuilds.top)
  try {
    const r4 = await t.sendMail({
      from: smtpUser,
      to: smtpUser,
      subject: 'Test 4 - To Self',
      text: 'Test sending to self'
    });
    console.log('Test 4 PASSED:', r4.messageId);
  } catch (e) {
    console.log('Test 4 FAILED:', e.code, e.message);
  }

  console.log('\nConfig used:', { smtpUser, contactEmail });
}

test();
