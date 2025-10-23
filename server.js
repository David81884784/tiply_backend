const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Config
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
const PORT = process.env.PORT || 5000;

// Modelul User (direct în acest fișier)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Conectare la MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectat la MongoDB'))
.catch(err => console.error('❌ Eroare MongoDB:', err));

// Ruta de înregistrare
app.post('/register', async (req, res) => {
  const { nume, email, parola } = req.body;

  if (!nume || !email || !parola) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'Emailul este deja folosit' });
    }

    const hashedPassword = await bcrypt.hash(parola, 10);
    const user = new User({ username: nume, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Utilizator înregistrat cu succes' });
  } catch (err) {
    console.error('❌ Eroare la înregistrare:', err);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
});

// Ruta de login
app.post('/login', async (req, res) => {
  const { email, parola } = req.body;

  if (!email || !parola) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email greșit' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Parola utilizatorului nu este setată corect' });
    }

    const isMatch = await bcrypt.compare(parola, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Parolă greșită' });
    }

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

// Ruta de verificare token
app.get('/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Token lipsă' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu există' });
    }

    res.json(user);
  } catch (err) {
    res.status(403).json({ message: 'Token invalid sau expirat' });
  }
});

// Test GET
app.get('/', (req, res) => {
  res.send('✅ Serverul funcționează');
});

// Pornire server
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
});
