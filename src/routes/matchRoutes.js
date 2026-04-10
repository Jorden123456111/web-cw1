const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createMatch, getAllMatches, getMatchById, updateMatch, deleteMatch } = require('../controllers/matchController');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Football match management (CRUD)
 */

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches with optional filtering and pagination
 *     tags: [Matches]
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
 *         name: season
 *         schema:
 *           type: string
 *         description: Filter by season (e.g. "2023-2024")
 *       - in: query
 *         name: competition
 *         schema:
 *           type: string
 *         description: Filter by competition name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, postponed]
 *         description: Filter by match status
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter matches involving a specific team
 *     responses:
 *       200:
 *         description: List of matches with pagination metadata
 */
router.get('/', getAllMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match details with team info
 *       404:
 *         description: Match not found
 */
router.get('/:id', validate([
  param('id').isInt().withMessage('Match ID must be an integer.'),
]), getMatchById);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [homeTeamId, awayTeamId, matchDate, season, competition]
 *             properties:
 *               homeTeamId:
 *                 type: integer
 *                 example: 1
 *               awayTeamId:
 *                 type: integer
 *                 example: 2
 *               homeScore:
 *                 type: integer
 *                 example: 2
 *               awayScore:
 *                 type: integer
 *                 example: 1
 *               matchDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-15"
 *               season:
 *                 type: string
 *                 example: "2023-2024"
 *               competition:
 *                 type: string
 *                 example: Premier League
 *               venue:
 *                 type: string
 *                 example: Old Trafford
 *               referee:
 *                 type: string
 *                 example: Michael Oliver
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, postponed]
 *                 default: completed
 *     responses:
 *       201:
 *         description: Match created successfully
 *       400:
 *         description: Validation error or team not found
 *       401:
 *         description: Authentication required
 */
router.post('/', authenticate, validate([
  body('homeTeamId').isInt().withMessage('homeTeamId must be an integer.'),
  body('awayTeamId').isInt().withMessage('awayTeamId must be an integer.'),
  body('matchDate').isDate().withMessage('matchDate must be a valid date (YYYY-MM-DD).'),
  body('season').trim().notEmpty().withMessage('Season is required.'),
  body('competition').trim().notEmpty().withMessage('Competition is required.'),
]), createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update a match
 *     tags: [Matches]
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
 *               homeScore:
 *                 type: integer
 *               awayScore:
 *                 type: integer
 *               matchDate:
 *                 type: string
 *                 format: date
 *               season:
 *                 type: string
 *               competition:
 *                 type: string
 *               venue:
 *                 type: string
 *               referee:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, postponed]
 *     responses:
 *       200:
 *         description: Match updated successfully
 *       404:
 *         description: Match not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id', authenticate, validate([
  param('id').isInt().withMessage('Match ID must be an integer.'),
]), updateMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
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
 *         description: Match deleted successfully
 *       404:
 *         description: Match not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id', authenticate, deleteMatch);

module.exports = router;
