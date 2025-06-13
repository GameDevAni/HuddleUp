// server.js (or api/send-invite.js)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Mailjet from "node-mailjet";

dotenv.config();

const mj = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/send-invite", async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || !(text || html)) {
    return res
      .status(400)
      .json({ error: "Missing to, subject, and text/html" });
  }

  try {
    await mj.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: "HuddleUp",
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });
    const result = await request;
    console.log("Mailjet send result:", result.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Mailjet error:", err.statusCode, err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

const port = process.env.API_PORT || 3001;
app.listen(port, () => {
  console.log(`Invite API listening on http://localhost:${port}`);
});
