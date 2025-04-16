const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Vehicule = sequelize.define('vehicule', {
  nom: DataTypes.STRING,
  type: DataTypes.STRING,
  localisation: DataTypes.STRING,
  prix_heure: DataTypes.INTEGER,
  image_url: DataTypes.STRING,
  disponible: DataTypes.BOOLEAN,
  loueur_id: DataTypes.INTEGER
}, {
  tableName: 'vehicules',
  timestamps: false
});

module.exports = Vehicule;