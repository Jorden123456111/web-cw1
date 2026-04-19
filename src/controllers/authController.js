const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ username, email, password, role: 'user' });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getProfile };
