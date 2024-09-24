import request from 'supertest';
import express from 'express';
import notebookRoutes from '../routes/notebookRoutes';
import * as WebScrapingService from '../services/WebScrapingService';
import * as DatabaseService from '../services/DatabaseService';
import { getFilteredData } from "../services/DatabaseService";

const app = express();
app.use(express.json());
app.use('/notebooks', notebookRoutes);

jest.mock('../services/WebScrapingService');
jest.mock('../services/DatabaseService');

describe('Conjunto de teste no  Notebook Routes', () => {
    beforeAll(() => {
        (WebScrapingService.fetchData as jest.Mock).mockResolvedValue([]);
        (WebScrapingService.processData as jest.Mock).mockResolvedValue([]);
        (DatabaseService.saveAllDataToDatabase as jest.Mock).mockResolvedValue(undefined);
        (getFilteredData as jest.Mock).mockResolvedValue([]);
    });

    it('Deve retornar uma lista de notebooks', async () => {
        const response = await request(app).get('/notebooks/get');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('Deve retornar dizendo que a sincronização foi bem sucedida', async () => {
        const response = await request(app).get('/notebooks/sync');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Dados salvos no banco de dados. Acesse /notebook/get para visualizar');
    });
});