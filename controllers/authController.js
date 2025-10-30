const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async (req, res) => {
  const { nume, email, parola } = req.body;

  if(!nume || !email || !parola) return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });

  try {
    const existingUser = await User.findOne({ email });
    if(existingUser) return res.status(400).json({ message: 'Email deja folosit' });

    const hashedPassword = await bcrypt.hash(parola, 10);
    const newUser = new User({ username: nume, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Cont creat cu succes!', token });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
};

exports.login = async (req, res) => {
  const { email, parola } = req.body;

  if(!email || !parola) return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });

  try {
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Email sau parolă greșită' });

    const isMatch = await bcrypt.compare(parola, user.password);
    if(!isMatch) return res.status(400).json({ message: 'Email sau parolă greșită' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Autentificat cu succes!', token });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la autentificare' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if(!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    res.json(user);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la preluarea utilizatorului' });
  }
};
