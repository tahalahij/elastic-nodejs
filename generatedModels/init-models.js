var DataTypes = require("sequelize").DataTypes;
var _article = require("./article");
var _user = require("./user");

function initModels(sequelize) {
  var article = _article(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  Article.belongsTo(User, { as: "createdByUser", foreignKey: "createdBy"});
  User.hasMany(Article, { as: "articles", foreignKey: "createdBy"});

  return {
    article,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
