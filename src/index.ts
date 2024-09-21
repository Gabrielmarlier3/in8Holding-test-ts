import express from 'express';
import { checkEnvVariables } from "./config/envConfig";
import cron from "node-cron";
import { fetchData, processData } from "./services/WebScrapingService";
import notebookRoutes from './routes/notebook';


const app = express();
const port = 3000;

checkEnvVariables();

app.use('/notebook', notebookRoutes);

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export { app }

//sincroniza a cada 1 hora
cron.schedule('0 * * * *', async () => {
    console.log('Updating products...');
    const data = await fetchData();
    await processData(data)
});

