import { Request, Response } from 'express';
import { fetchData, processData } from '../services/WebScrapingService';
import { saveAllDataToDatabase, getFilteredData } from '../services/DatabaseService';
import ProductModel from "../models/ProductModel";

// Sincroniza os dados do web scraping e os salva no banco de dados
async function syncData(req: Request, res: Response): Promise<Response>{
    try {
        const chunkSizeParam = req.query.chunkSize as string;
        const chunkSize: number | undefined = chunkSizeParam ? parseInt(chunkSizeParam, 10) : undefined;

        const allData = await fetchData();
        const processedData = await processData(allData, chunkSize);

        await saveAllDataToDatabase(processedData);
        return res.status(200).send('Dados salvos no banco de dados. Acesse /notebook/get para visualizar');
    } catch (error) {
        console.error('Erro durante sincronização dos dados:', error);
        return res.status(500).send('Erro, verifique o readme.md para mais informações');
    }
}

// Filtra e busca os produtos com base nos parâmetros de consulta
async function getProducts(req: Request, res: Response): Promise<Response>{
    try {
        const filter = req.query.item as string || 'Lenovo';
        const orderBy = ( req.query.orderBy as 'ASC' | 'DESC' ) || 'ASC';

        if ( orderBy !== 'ASC' && orderBy !== 'DESC' ) {
            return res.status(400).send('O parâmetro orderBy deve ser "ASC" ou "DESC"');
        }

        const data: ProductModel[] = await getFilteredData(filter, orderBy);

        if ( !data || data.length === 0 ) {
            return res.status(404).send('Nenhum item encontrado, verifique os parametros de consulta, ou execute /sync para sincronizar os dados');
        }

        return res.json(data);
    } catch (error) {
        console.error('Erro ao acessar o banco de dados:', error);
        return res.status(500).send('Tente executar /sync para sincronizar os dados');
    }
}


export { syncData, getProducts };
