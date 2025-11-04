const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---
app.use(express.json());

// --- CORS complet pentru preflight ---
const allowedOrigins = [
  "https://tiply-2xgc.vercel.app",
  "https://tiply-frontend-2xgc-git-main-davids-projects-a9354ccb.vercel.app",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  // Răspunde imediat la OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// --- Routes reale fără redirect ---
app.use("/auth", authRoutes);

// --- Endpoint test ---
app.get("/", (req, res) => {
  res.send("✅ Backend funcționează cu CORS pe Vercel");
});

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectat la MongoDB"))
  .catch(err => console.error("❌ Eroare MongoDB:", err));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server rulează pe port ${PORT}`));
