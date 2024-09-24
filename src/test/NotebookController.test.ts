import request from 'supertest';
import { app } from '../index';
import { fetchData, processData } from '../services/WebScrapingService';
import { saveAllDataToDatabase, getFilteredData } from '../services/DatabaseService';

jest.mock('../services/WebScrapingService');
jest.mock('../services/DatabaseService');

describe('Testes do NotebookController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Deve buscar, processar e salvar dados com sucesso', async () => {
        const fakeData = [{ title: 'Produto Teste', link: 'http://example.com', description: 'Teste' }];
        const processedData = [{ title: 'Produto Processado', link: 'http://example.com', description: 'Processado' }];

        (fetchData as jest.Mock).mockResolvedValue(fakeData);
        (processData as jest.Mock).mockResolvedValue(processedData);
        (saveAllDataToDatabase as jest.Mock).mockResolvedValue(true);

        const response = await request(app).get('/notebook/sync?chunkSize=100');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Dados salvos no banco de dados');

        expect(fetchData).toHaveBeenCalled();
        expect(processData).toHaveBeenCalledWith(fakeData, 100);
        expect(saveAllDataToDatabase).toHaveBeenCalledWith(processedData);
    });

    it('Deve retornar erro 500 se ocorrer um erro ao buscar dados', async () => {
        (fetchData as jest.Mock).mockRejectedValue(new Error('Erro ao buscar dados'));

        const response = await request(app).get('/notebook/sync?chunkSize=100');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Erro, verifique o readme.md para mais informações');
    });

    it('Deve buscar dados filtrados do banco com sucesso', async () => {
        const fakeResponse = [
            {
                title: 'Produto Teste',
                link: 'http://example.com',
                description: 'Teste',
                swatchesPrices: '[{"price": "100.00", "capacity": "128"}]',
                reviewCount: 10,
                starCount: 5,
            },
        ];

        (getFilteredData as jest.Mock).mockResolvedValue(fakeResponse);

        const response = await request(app).get('/notebook/get?item=Lenovo&orderBy=ASC');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeResponse);
        expect(getFilteredData).toHaveBeenCalledWith('Lenovo', 'ASC');
    });

    it('Deve retornar erro 500 ao falhar em buscar dados do banco', async () => {
        (getFilteredData as jest.Mock).mockRejectedValue(new Error('Erro no banco de dados'));

        const response = await request(app).get('/notebook/get?item=Lenovo&orderBy=ASC');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Tente executar /sync para sincronizar os dados');
    });

    it('Deve retornar erro 400 se o parâmetro orderBy for inválido', async () => {
        const response = await request(app).get('/notebook/get?item=Lenovo&orderBy=DESCX');

        expect(response.status).toBe(400);
        expect(response.text).toBe('O parâmetro orderBy deve ser "ASC" ou "DESC"');
    });

    it('Deve retornar erro 404 se nenhum item for encontrado', async () => {
        (getFilteredData as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get('/notebook/get?item=Lenovo&orderBy=ASC');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Nenhum item encontrado, verifique os parametros de consulta, ou execute /sync para sincronizar os dados');
    });
});
