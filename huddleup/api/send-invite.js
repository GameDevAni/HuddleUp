// server.js (at project root)
// or api/send-invite.js if you’re using serverless functions

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Mailjet from 'node-mailjet';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// initialize the Mailjet client
const mj = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

app.post('/api/send-invite', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !(text || html)) {
    return res.status(400).json({ error: 'Missing to, subject, and text/html' });
  }

  try {
    // this promise returns the result—no separate `request` var needed
    const result = await mj
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
              Name:  'HuddleUp Team',
            },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
          },
        ],
      });

    console.log('📨 Mailjet send result:', result.body);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ Mailjet error:', err.statusCode, err.message);
    return res
      .status(err.statusCode || 500)
      .json({ error: err.message || 'Mailjet send failed' });
  }
});

const port = process.env.API_PORT || 3001;
app.listen(port, () => {
  console.log(`Invite API listening on http://localhost:${port}`);
});
