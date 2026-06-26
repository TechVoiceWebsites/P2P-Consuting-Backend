import dotenv from "dotenv";
dotenv.config();

import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());


// Check .env values
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Not Loaded ❌");
/* =========================
   ENV CHECK (SAFE)
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
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP
transporter.verify((err) => {
  if (err) console.log("SMTP ERROR:", err);
  else console.log("SMTP READY ✅");
});

/* =========================
   ENQUIRY API
========================= */
app.post("/send-enquiry", async (req, res) => {
  try {
    const { name, company, businessType, phone, email, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: "New Consulting Form Enquiry 🚀",
      html: `
        <h2>New Enquiry Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Business Type:</b> ${businessType}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


/* =========================
   START SERVER
========================= */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});











