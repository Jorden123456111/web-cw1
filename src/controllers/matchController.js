const { Match, Team } = require('../models');
const { Op } = require('sequelize');

const createMatch = async (req, res, next) => {
  try {
    const { homeTeamId, awayTeamId } = req.body;

    if (homeTeamId === awayTeamId) {
      return res.status(400).json({ error: 'Home team and away team must be different.' });
    }

    const homeTeam = await Team.findByPk(homeTeamId);
    const awayTeam = await Team.findByPk(awayTeamId);

    if (!homeTeam) return res.status(400).json({ error: 'Home team not found.' });
    if (!awayTeam) return res.status(400).json({ error: 'Away team not found.' });

    const match = await Match.create(req.body);
    res.status(201).json({ message: 'Match created successfully.', match });
  } catch (error) {
    next(error);
  }
};

const getAllMatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, season, competition, status, teamId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (season) where.season = season;
    if (competition) where.competition = competition;
    if (status) where.status = status;
    if (teamId) {
      where[Op.or] = [
        { homeTeamId: parseInt(teamId) },
        { awayTeamId: parseInt(teamId) },
      ];
    }

    const { count, rows } = await Match.findAndCountAll({
      where,
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'shortName'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'shortName'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['matchDate', 'DESC']],
    });

    res.json({
      matches: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    res.json({ match });
  } catch (error) {
    next(error);
  }
};

const updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    await match.update(req.body);
    res.json({ message: 'Match updated successfully.', match });
  } catch (error) {
    next(error);
  }
};

const deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    await match.destroy();
    res.json({ message: 'Match deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMatch, getAllMatches, getMatchById, updateMatch, deleteMatch };
