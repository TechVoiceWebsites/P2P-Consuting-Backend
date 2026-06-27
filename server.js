import dotenv from "dotenv";
dotenv.config();

import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(helmet());
app.use(cors({
  origin: "https://p2pconsulting.in",
  methods: ["POST", "GET"], 
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));


/* =========================
   RATE LIMIT (ANTI SPAM)
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/send-enquiry", limiter);

/* =========================
   ENV CHECK
========================= */
console.log("EMAIL_USER LOADED:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS LOADED:", !!process.env.EMAIL_PASS);

/* =========================
   NODEMAILER SETUP
========================= */
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* SMTP VERIFY (optional safe) */
transporter.verify((error) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error.message);
  } else {
    console.log("✅ SMTP READY");
  }
});

/* =========================
   ROOT API
========================= */
app.get("/", (req, res) => {
  res.send("🚀 P2P Consulting Backend Running Successfully");
});

/* =========================
   ENQUIRY API
========================= */
app.post("/send-enquiry", (req, res) => {
  const { name, company, businessType, phone, email, message } = req.body;

  /* validation */
  if (!name || !company || !phone || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  /* instant response (fast UI) */
  res.json({
    success: true,
    message: "Received successfully",
  });

  /* background email send */
  setImmediate(async () => {
    try {
      await transporter.sendMail({
        from: `"P2P Consulting" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: "🚀 New Consulting Enquiry",
        html: `
          <h2>New Enquiry Received</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Company:</b> ${company}</p>
          <p><b>Business Type:</b> ${businessType}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      });

      console.log("📧 Email sent successfully");
    } catch (err) {
      console.error("📧 Email failed:", err.message);
    }
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});