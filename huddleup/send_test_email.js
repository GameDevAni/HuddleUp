import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';
dotenv.config();

const mj = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

async function sendTest() {
  try {
    const res = await mj
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          From: { Email: process.env.MJ_SENDER_EMAIL, Name: 'HuddleUp Test' },
          To:   [{ Email: 'nike.dhingra27@gmail.com' }],
          Subject: '📬 Mailjet Test',
          TextPart: 'If you see this, Mailjet is working!',
        }],
      });
    console.log('📨 Test send result:', res.body);
  } catch (err) {
    console.error('❌ Test send error:', err);
  }
}

sendTest();
