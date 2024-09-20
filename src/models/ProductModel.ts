import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Certifique-se de que isso aponta para a instância correta do Sequelize

class ProductModel extends Model {
    public id!: number;
    public title!: string;
    public link!: string;
    public description!: string;
    public swatchesPrices!: object;
    public reviewCount!: number;
    public starCount!: number;
}

ProductModel.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    swatchesPrices: {
        type: DataTypes.JSON,
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    starCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize,
    tableName: 'products',
});

export default ProductModel;
