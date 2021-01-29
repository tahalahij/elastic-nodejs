import { DataTypes, Model } from 'sequelize';
import sequelize from '../connections/mysql';

class Thesis extends Model {
}

Thesis.init({
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
}, {
    sequelize,
    modelName: 'thesis',
});
export { Thesis };
