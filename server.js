const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const app = express();

// --- Middleware pentru parsare JSON ---
app.use(express.json());

// --- CORS configurat corect pentru Vercel ---
const allowedOrigins = [
  "https://tiply-2xgc.vercel.app", // Frontend-ul de pe Vercel
  "http://localhost:5173"          // Pentru testare locală
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite cereri fără "origin" (de ex. server-side)
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

// --- Rute principale ---
app.use("/auth", authRoutes);

// --- Endpoint test ---
app.get("/", (req, res) => {
  res.send("✅ Backend funcționează corect pe Vercel!");
});

// --- Conectare la MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Conectat la MongoDB"))
  .catch((err) => console.error("❌ Eroare MongoDB:", err));

// --- Export pentru Vercel ---
module.exports = app;
