const { Team, Player, Match } = require('../models');
const { Op } = require('sequelize');

const createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ message: 'Team created successfully.', team });
  } catch (error) {
    next(error);
  }
};

const getAllTeams = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const { country, league, search } = req.query;
    const where = {};

    if (country) where.country = country;
    if (league) where.league = league;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Team.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    res.json({
      teams: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Player, as: 'players' }],
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    await team.update(req.body);
    res.json({ message: 'Team updated successfully.', team });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    await team.destroy();
    res.json({ message: 'Team deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam };
