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



export async function checkDatabaseConnection(): Promise<void> {
    try {
        await sequelize.authenticate();
        console.log('Conexão bem sucedida.');
    } catch (error) {
        console.log('Banco de dados desligado, digite docker-compose up --build no terminal');
    }

    const intervalId = setInterval(async () => {
        try {
            await sequelize.authenticate();
            console.log('Conexão bem sucedida.');
            clearInterval(intervalId);
        } catch (error) {

        }
    }, 1000);
}

export default sequelize;
