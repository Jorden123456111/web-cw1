const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward'),
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  shirtNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  goals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  assists: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  appearances: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  yellowCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  redCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Teams',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['teamId'] },
    { fields: ['position'] },
    { fields: ['nationality'] },
    { fields: ['goals'] },
  ],
});

module.exports = Player;
