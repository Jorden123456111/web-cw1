const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createPlayer, getAllPlayers, getPlayerById, updatePlayer, deletePlayer } = require('../controllers/playerController');

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Football player management (CRUD)
 */

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players with optional filtering and pagination
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [Goalkeeper, Defender, Midfielder, Forward]
 *         description: Filter by position
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filter by nationality
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter by team ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by player name
 *     responses:
 *       200:
 *         description: List of players with pagination metadata
 */
router.get('/', getAllPlayers);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player details with team info
 *       404:
 *         description: Player not found
 */
router.get('/:id', validate([
  param('id').isInt().withMessage('Player ID must be an integer.'),
]), getPlayerById);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nationality, position]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marcus Rashford
 *               nationality:
 *                 type: string
 *                 example: England
 *               position:
 *                 type: string
 *                 enum: [Goalkeeper, Defender, Midfielder, Forward]
 *                 example: Forward
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1997-10-31"
 *               shirtNumber:
 *                 type: integer
 *                 example: 10
 *               goals:
 *                 type: integer
 *                 example: 5
 *               assists:
 *                 type: integer
 *                 example: 3
 *               appearances:
 *                 type: integer
 *                 example: 20
 *               yellowCards:
 *                 type: integer
 *                 example: 2
 *               redCards:
 *                 type: integer
 *                 example: 0
 *               teamId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Player created successfully
 *       400:
 *         description: Validation error or team not found
 *       401:
 *         description: Authentication required
 */
router.post('/', authenticate, validate([
  body('name').trim().notEmpty().withMessage('Player name is required.'),
  body('nationality').trim().notEmpty().withMessage('Nationality is required.'),
  body('position').isIn(['Goalkeeper', 'Defender', 'Midfielder', 'Forward']).withMessage('Position must be Goalkeeper, Defender, Midfielder, or Forward.'),
]), createPlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [Goalkeeper, Defender, Midfielder, Forward]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               shirtNumber:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               appearances:
 *                 type: integer
 *               yellowCards:
 *                 type: integer
 *               redCards:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Player updated successfully
 *       404:
 *         description: Player not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id', authenticate, validate([
  param('id').isInt().withMessage('Player ID must be an integer.'),
]), updatePlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Delete a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       404:
 *         description: Player not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id', authenticate, deletePlayer);

module.exports = router;
