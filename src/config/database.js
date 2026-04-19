const { Sequelize } = require('sequelize');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';
const storage = process.env.DB_STORAGE
  || (isTest ? ':memory:' : path.join(__dirname, '..', '..', 'database.db'));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

module.exports = sequelize;
