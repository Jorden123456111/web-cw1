const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam } = require('../controllers/teamController');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Football team management (CRUD)
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams with optional filtering and pagination
 *     tags: [Teams]
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
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         description: Filter by league
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by team name
 *     responses:
 *       200:
 *         description: List of teams with pagination metadata
 */
router.get('/', getAllTeams);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a team by ID (includes players)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team details with players
 *       404:
 *         description: Team not found
 */
router.get('/:id', validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), getTeamById);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, country, league]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Manchester United
 *               shortName:
 *                 type: string
 *                 example: MUN
 *               country:
 *                 type: string
 *                 example: England
 *               league:
 *                 type: string
 *                 example: Premier League
 *               founded:
 *                 type: integer
 *                 example: 1878
 *               stadium:
 *                 type: string
 *                 example: Old Trafford
 *               logoUrl:
 *                 type: string
 *                 example: https://example.com/logo.png
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/', authenticate, validate([
  body('name').trim().notEmpty().withMessage('Team name is required.'),
  body('country').trim().notEmpty().withMessage('Country is required.'),
  body('league').trim().notEmpty().withMessage('League is required.'),
]), createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
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
 *               shortName:
 *                 type: string
 *               country:
 *                 type: string
 *               league:
 *                 type: string
 *               founded:
 *                 type: integer
 *               stadium:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       404:
 *         description: Team not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id', authenticate, validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team (admin only)
 *     tags: [Teams]
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
 *         description: Team deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Team not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.delete('/:id', authenticate, authorizeAdmin, validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), deleteTeam);

module.exports = router;
