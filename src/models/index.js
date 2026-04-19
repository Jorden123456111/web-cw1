const sequelize = require('../config/database');
const User = require('./User');
const Team = require('./Team');
const Player = require('./Player');
const Match = require('./Match');

// Associations
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Team.hasMany(Match, { foreignKey: 'homeTeamId', as: 'homeMatches' });
Team.hasMany(Match, { foreignKey: 'awayTeamId', as: 'awayMatches' });
Match.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });

module.exports = {
  sequelize,
  User,
  Team,
  Player,
  Match,
};
