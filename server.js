const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());

// --- CORS ---
const allowedOrigins = [
  'https://tiply-2xgc.vercel.app',
  'https://tiply-frontend-2xgc-git-main-davids-projects-a9354ccb.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('CORS policy: origin not allowed'), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
}));

// --- Routes ---
app.use('/auth', authRoutes);

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI; // ia din .env
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectat la MongoDB'))
  .catch(err => console.error('❌ Eroare MongoDB:', err));

// --- Test server ---
app.get('/', (req,res) => res.send('✅ Serverul funcționează'));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server rulează pe port ${PORT}`));
