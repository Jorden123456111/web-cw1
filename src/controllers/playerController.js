const { Player, Team } = require('../models');
const { Op } = require('sequelize');

const createPlayer = async (req, res, next) => {
  try {
    if (req.body.teamId) {
      const team = await Team.findByPk(req.body.teamId);
      if (!team) {
        return res.status(400).json({ error: 'Team not found with the given teamId.' });
      }
    }

    const player = await Player.create(req.body);
    res.status(201).json({ message: 'Player created successfully.', player });
  } catch (error) {
    next(error);
  }
};

const getAllPlayers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, position, nationality, teamId, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (position) where.position = position;
    if (nationality) where.nationality = nationality;
    if (teamId) where.teamId = parseInt(teamId);
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Player.findAndCountAll({
      where,
      include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'shortName'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    res.json({
      players: rows,
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

const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{ model: Team, as: 'team' }],
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.json({ player });
  } catch (error) {
    next(error);
  }
};

const updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    if (req.body.teamId) {
      const team = await Team.findByPk(req.body.teamId);
      if (!team) {
        return res.status(400).json({ error: 'Team not found with the given teamId.' });
      }
    }

    await player.update(req.body);
    res.json({ message: 'Player updated successfully.', player });
  } catch (error) {
    next(error);
  }
};

const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    await player.destroy();
    res.json({ message: 'Player deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPlayer, getAllPlayers, getPlayerById, updatePlayer, deletePlayer };
