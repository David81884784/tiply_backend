const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Config
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
const PORT = process.env.PORT || 5000;

// --- CORS Setup pentru frontend-ul pe Vercel ---
const allowedOrigins = [
  'https://tiply-frontend-2xgc-git-main-davids-projects-a9354ccb.vercel.app',
  'http://localhost:5173' // dacă testezi local
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // permite cererile din Postman / server-side
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'CORS policy: origin not allowed';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// --- Modelul User ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- Conectare MongoDB Atlas ---
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectat la MongoDB Atlas'))
.catch(err => console.error('❌ Eroare MongoDB:', err));

// --- Rute Auth ---
// Înregistrare
app.post('/register', async (req, res) => {
  const { nume, email, parola } = req.body;

  if (!nume || !email || !parola) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: 'Emailul este deja folosit' });

    const hashedPassword = await bcrypt.hash(parola, 10);
    const user = new User({ username: nume, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Utilizator înregistrat cu succes' });
  } catch (err) {
    console.error('❌ Eroare la înregistrare:', err);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, parola } = req.body;

  if (!email || !parola) return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email sau parolă greșită' });

    const isMatch = await bcrypt.compare(parola, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Email sau parolă greșită' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('❌ Eroare la login:', err);
    res.status(500).json({ message: 'Eroare la autentificare' });
  }
});

// Verificare token
app.get('/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Token lipsă' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilizatorul nu există' });

    res.json(user);
  } catch (err) {
    res.status(403).json({ message: 'Token invalid sau expirat' });
  }
});

// Test server
app.get('/', (req, res) => {
  res.send('✅ Serverul funcționează');
});

// Pornire server
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe port ${PORT}`);
});
