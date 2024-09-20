import { Request, Response } from 'express';
import { fetchData, processData } from '../services/WebScrapingService';
import { saveAllDataToDatabase, getFilteredData } from '../services/DatabaseService';

// Sincroniza os dados do web scraping e os salva no banco de dados
const syncData = async (req: Request, res: Response): Promise<Response> => {
    try {
        const chunkSizeParam = req.query.chunkSize as string;
        const chunkSize: number | undefined = chunkSizeParam ? parseInt(chunkSizeParam, 10) : undefined;
        const allData = await fetchData();
        const processedData = await processData(allData, chunkSize);

        await saveAllDataToDatabase(processedData);
        return res.status(200).send('Dados salvos no banco de dados. Acesse /notebook/get para visualizar');
    }
    catch (error) {
        console.error('Erro durante sincronização dos dados:', error);
        return res.status(500).send('Erro ao acessar a página web');
    }
};


// Filtra e busca os produtos com base nos parâmetros de consulta
const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const filter = req.query.item as string || 'Lenovo';
        const orderBy = (req.query.orderBy as 'ASC' | 'DESC') || 'ASC';
        const data = await getFilteredData(filter, orderBy);
        return res.json(data);
    }
    catch (error) {
        console.error('Erro ao acessar o banco de dados:', error);
        return res.status(500).send('Tente executar /sync para sincronizar os dados. Caso esteja usando o filtro, tente com outro valor');
    }
};


export { syncData, getProducts };
