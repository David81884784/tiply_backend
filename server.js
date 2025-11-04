const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---
app.use(express.json());

// --- CORS ---
const allowedOrigins = [
  "https://tiply-2xgc.vercel.app",
  "https://tiply-frontend-2xgc-git-main-davids-projects-a9354ccb.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite cereri fără origin (preflight sau server-side)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("❌ CORS blocat:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- Preflight pentru toate rutele ---
app.options("*", cors());

// --- Redirecționare frontend pentru register/login ---
app.post("/register", (req, res, next) => {
  req.url = "/auth/register";
  next();
});

app.post("/login", (req, res, next) => {
  req.url = "/auth/login";
  next();
});

// --- Routes ---
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
