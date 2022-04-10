'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pixel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Pixel.init({
    timestamp: {type: DataTypes.DATE, allowNull: false},
    user_id: {type: DataTypes.STRING, allowNull: false},
    pixel_color: {type: DataTypes.STRING, allowNull: false},
    x: {type: DataTypes.INTEGER, allowNull: false},
    y: {type: DataTypes.INTEGER, allowNull: false},
    x2: {type: DataTypes.INTEGER, allowNull: true},
    y2: {type: DataTypes.INTEGER, allowNull: true}
  }, {
    sequelize,
    modelName: 'Pixel',
  });
  return Pixel;
};