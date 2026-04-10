const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  league: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  founded: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stadium: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Team;
