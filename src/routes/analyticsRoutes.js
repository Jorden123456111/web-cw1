const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getLeaderboard,
  getTopScorers,
  getTeamPerformance,
  getHeadToHead,
  getSeasonSummary,
  getFormTrend,
  getHomeAwaySplit,
} = require('../controllers/analyticsController');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Performance analytics, leaderboards, and statistical endpoints
 */

/**
 * @swagger
 * /api/analytics/leaderboard:
 *   get:
 *     summary: Get league standings / leaderboard
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: string
 *         description: Season identifier (e.g. "2023-2024")
 *         example: "2023-2024"
 *       - in: query
 *         name: competition
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition name (e.g. "Premier League")
 *         example: Premier League
 *     responses:
 *       200:
 *         description: League standings with points, goal difference, wins, draws, losses
 *       400:
 *         description: Missing required query parameters
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @swagger
 * /api/analytics/top-scorers:
 *   get:
 *     summary: Get top scorers across all teams
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top scorers to return
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [Goalkeeper, Defender, Midfielder, Forward]
 *         description: Filter by position
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter by team
 *     responses:
 *       200:
 *         description: List of top scorers with goals, assists, and per-game stats
 */
router.get('/top-scorers', getTopScorers);

/**
 * @swagger
 * /api/analytics/teams/{id}/performance:
 *   get:
 *     summary: Get detailed performance summary for a team
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *         description: Filter by season
 *       - in: query
 *         name: competition
 *         schema:
 *           type: string
 *         description: Filter by competition
 *     responses:
 *       200:
 *         description: Team performance stats including win rate, goals, clean sheets, recent form
 *       404:
 *         description: Team not found
 */
router.get('/teams/:id/performance', validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), getTeamPerformance);

/**
 * @swagger
 * /api/analytics/head-to-head:
 *   get:
 *     summary: Head-to-head comparison between two teams
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: team1Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: First team ID
 *       - in: query
 *         name: team2Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Second team ID
 *     responses:
 *       200:
 *         description: Head-to-head record including wins, goals, and recent matches
 *       400:
 *         description: Missing required query parameters
 *       404:
 *         description: One or both teams not found
 */
router.get('/head-to-head', getHeadToHead);

/**
 * @swagger
 * /api/analytics/seasons/{season}:
 *   get:
 *     summary: Get season summary with trends and statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: string
 *         description: Season identifier (e.g. "2023-2024")
 *     responses:
 *       200:
 *         description: Season-level stats including total goals, home/away win rates, monthly trends
 *       404:
 *         description: No matches found for the given season
 */
router.get('/seasons/:season', getSeasonSummary);

/**
 * @swagger
 * /api/analytics/teams/{id}/form-trend:
 *   get:
 *     summary: Get rolling form trend for a team
 *     description: >
 *       Returns match-by-match results in chronological order with cumulative points.
 *       Useful for visualising momentum and identifying winning/losing streaks.
 *       The "last" parameter caps at 50 to prevent oversized responses.
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *         description: Filter by season (e.g. "2023-2024")
 *       - in: query
 *         name: competition
 *         schema:
 *           type: string
 *         description: Filter by competition
 *       - in: query
 *         name: last
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Number of recent matches to analyse (max 50)
 *     responses:
 *       200:
 *         description: Rolling form with per-match results and cumulative points curve
 *       404:
 *         description: Team not found
 */
router.get('/teams/:id/form-trend', validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), getFormTrend);

/**
 * @swagger
 * /api/analytics/teams/{id}/home-away:
 *   get:
 *     summary: Get home vs away performance split for a team
 *     description: >
 *       Compares a team's record when playing at home versus away.
 *       Returns wins, draws, losses, goals, clean sheets, and win rates for each venue type,
 *       plus a "homeAdvantage" metric showing the percentage-point difference in win rate.
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *         description: Filter by season
 *       - in: query
 *         name: competition
 *         schema:
 *           type: string
 *         description: Filter by competition
 *     responses:
 *       200:
 *         description: Home and away statistics with comparison metrics
 *       404:
 *         description: Team not found
 */
router.get('/teams/:id/home-away', validate([
  param('id').isInt().withMessage('Team ID must be an integer.'),
]), getHomeAwaySplit);

module.exports = router;
