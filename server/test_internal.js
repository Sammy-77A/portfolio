const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpUser = process.env.SMTP_USER || 'hello@samuelbuilds.top';
const smtpPass = process.env.SMTP_PASS;

async function test() {
  const t = nodemailer.createTransport({
    host: 'mail.samuelbuilds.top',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await t.sendMail({
      from: smtpUser,
      to: smtpUser,
      subject: 'INTERNAL TEST ' + Date.now(),
      text: 'Testing if email arrives in webmail'
    });
    console.log('SUCCESS:', info.messageId);
  } catch (e) {
    console.error('FAILURE:', e.code, e.message);
  }
}
test();
