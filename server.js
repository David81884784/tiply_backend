const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// Middleware JSON
app.use(express.json());

// --- CORS complet pentru Vercel frontend ---
const allowedOrigins = [
  "https://tiply-2xgc.vercel.app",
  "https://tiply-backend-ocpqbusff-davids-projects-a9354ccb.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("❌ CORS blocat:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Răspunde la OPTIONS pentru toate rutele
app.options("*", cors());

// --- Routes fără redirect-uri ---
app.use("/auth", authRoutes);

// Endpoint test
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