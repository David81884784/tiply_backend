const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---
app.use(express.json());

// --- CORS corect pentru Vercel ---
const allowedOrigins = [
  'https://tiply-2xgc.vercel.app', // frontend live
  'https://tiply-frontend-2xgc-git-main-davids-projects-a9354ccb.vercel.app', // preview build
  'http://localhost:5173' // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite cereri fără origin (ex: curl, server-side)
    if (!origin) return callback(null, true);

    // Permite doar domeniile din lista de mai sus
    if (!allowedOrigins.includes(origin)) {
      console.warn(`❌ Blocată cerere CORS de la: ${origin}`);
      return callback(new Error('CORS policy: origin not allowed'), false);
    }

    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Routes ---
app.use('/auth', authRoutes);

// --- Test endpoint ---
app.get('/', (req, res) => {
  res.send('✅ Serverul funcționează corect pe Vercel');
});

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectat la MongoDB'))
  .catch(err => console.error('❌ Eroare MongoDB:', err));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server rulează pe portul ${PORT}`));
