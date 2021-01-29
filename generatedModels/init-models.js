var DataTypes = require("sequelize").DataTypes;
var _theses = require("./theses");
var _thesis = require("./thesis");

function initModels(sequelize) {
  var theses = _theses(sequelize, DataTypes);
  var thesis = _thesis(sequelize, DataTypes);


  return {
    theses,
    thesis,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
