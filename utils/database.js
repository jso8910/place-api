const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db.sqlite',
    logging: false,
});
module.exports = require('../models/pixel')(sequelize, DataTypes);