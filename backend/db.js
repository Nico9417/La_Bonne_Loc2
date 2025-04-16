const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('labonloc', 'root', 'Nico9417', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;

