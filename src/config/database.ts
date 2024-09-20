import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'yourdbname',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

export const connectToDatabase = async (): Promise<Sequelize> => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL database');
        return sequelize;
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        process.exit(1);
    }
};

export default sequelize;