const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { register, login, getProfile } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (role is always set to "user")
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: securePass123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', validate([
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
]), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
]), login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Authentication required
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;
