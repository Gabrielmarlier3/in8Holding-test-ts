import request from 'supertest';
import { app } from '../index';
import { getFilteredData, saveAllDataToDatabase } from '../services/DatabaseService';
import { fetchData, processData } from '../services/WebScrapingService';

jest.mock('../services/WebScrapingService', () => ({
    fetchData: jest.fn(),
    processData: jest.fn(),
}));

jest.mock('../services/DatabaseService', () => ({
    saveAllDataToDatabase: jest.fn(),
    getFilteredData: jest.fn(),
}));

describe('Conjunto de testes em NotebookController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve buscar, processar e salvar dados com sucesso', async () => {
        const fakeData = [
            { title: 'Produto Teste', link: 'http://example.com', description: 'Teste' },
        ];
        const processedFakeData = [
            { title: 'Produto Processado', link: 'http://example.com', description: 'Processado' },
        ];

        // Configurando valores de retorno dos mocks
        (fetchData as jest.Mock).mockResolvedValue(fakeData);
        (processData as jest.Mock).mockResolvedValue(processedFakeData);
        (saveAllDataToDatabase as jest.Mock).mockResolvedValue(true);

        // Fazendo a requisição
        const response = await request(app).get('/notebook/sync?chunkSize=100');

        // Verificando o resultado
        expect(response.status).toBe(200);
        expect(response.text).toContain('Dados salvos no banco de dados');

        // Verificando as chamadas das funções mock
        expect(fetchData).toHaveBeenCalledTimes(1);
        expect(processData).toHaveBeenCalledWith(fakeData, 100);
        expect(saveAllDataToDatabase).toHaveBeenCalledWith(processedFakeData);
    });

    it('deve retornar um erro 500 se houver um erro', async () => {
        // Simulando um erro ao buscar dados
        (fetchData as jest.Mock).mockRejectedValue(new Error('Web scraping inicial falhou, não retornou dados válidos'));

        const response = await request(app).get('/notebook/sync?chunkSize=100');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Erro, verifique o readme.md para mais informações');
    });

    it('Deve buscar no banco de dados os items do filtro e retornar com sucesso', async () => {
        // Simulando o retorno de `getFilteredData`
        const fakeResponse = [
            {
                title: 'Produto Teste',
                link: 'http://example.com',
                description: 'Teste',
                swatchesPrices: '[{"price": "100.00", "capacity": "128"}]',
                reviewCount: 10,
                starCount: 5,
            }
        ];
        (getFilteredData as jest.Mock).mockResolvedValue(fakeResponse);

        const fakeFilteredData = { filter: 'Lenovo', orderBy: 'ASC' };

        // Fazendo a requisição
        const res = await request(app).get(`/notebook/get?item=${fakeFilteredData.filter}&orderBy=${fakeFilteredData.orderBy}`);

        // Verificando se a função foi chamada corretamente
        expect(getFilteredData).toHaveBeenCalledWith('Lenovo', 'ASC');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeResponse);
    });

    it('Deve retornar erro ao buscar no banco de dados', async () => {
        // Simulando um erro ao buscar dados no banco
        (getFilteredData as jest.Mock).mockRejectedValue(new Error('Erro ao buscar dados no banco de dados'));

        const fakeFilteredData = { filter: 'Lenovo', orderBy: 'ASC' };

        const res = await request(app).get(`/notebook/get?item=${fakeFilteredData.filter}&orderBy=${fakeFilteredData.orderBy}`);

        expect(res.status).toBe(500);
        expect(res.text).toBe('Tente executar /sync para sincronizar os dados');
    });

    it('Deve retornar um erro 400 se o parâmetro orderBy for inválido', async () => {
        const fakeFilteredData = { filter: 'Lenovo', orderBy: 'DESCX' };

        const res = await request(app).get(`/notebook/get?item=${fakeFilteredData.filter}&orderBy=${fakeFilteredData.orderBy}`);

        expect(res.status).toBe(400);
        expect(res.text).toBe('O parâmetro orderBy deve ser "ASC" ou "DESC"');
    });

    it('Deve retornar um erro 404 se não encontrar nenhum item', async () => {
        // Simulando que nenhum item foi encontrado
        (getFilteredData as jest.Mock).mockResolvedValue(null);

        const fakeFilteredData = { filter: 'Lenovo', orderBy: 'ASC' };

        const res = await request(app).get(`/notebook/get?item=${fakeFilteredData.filter}&orderBy=${fakeFilteredData.orderBy}`);

        expect(res.status).toBe(404);
        expect(res.text).toBe('Nenhum item encontrado, verifique os parametros de consulta');
    });
});
