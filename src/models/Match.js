const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  homeTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id',
    },
  },
  awayTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id',
    },
  },
  homeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  awayScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  matchDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  competition: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referee: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'postponed'),
    defaultValue: 'completed',
  },
}, {
  timestamps: true,
});

module.exports = Match;
