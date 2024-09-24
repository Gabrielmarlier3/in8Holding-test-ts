import express from 'express';
import { checkEnvVariables } from "./config/envConfig";
import cron from "node-cron";
import { fetchData, processData } from "./services/WebScrapingService";
import notebookRoutes from './routes/notebookRoutes';
import { checkDatabaseConnection } from "./config/database";


const app = express();
const port = 3000;

checkEnvVariables();


app.use('/notebook', notebookRoutes);

async function startServer(){
    try {
        checkEnvVariables();
        await checkDatabaseConnection();
        const server = app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

//sincroniza as meia-noite hora
cron.schedule('0 0 * * *', async () => {
    console.log('Updating products...');
    const data = await fetchData();
    await processData(data)
});


export { app }


