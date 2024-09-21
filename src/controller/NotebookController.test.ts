import request from 'supertest';
import { app } from '../index';
import { getFilteredData, saveAllDataToDatabase } from '../services/DatabaseService';
import { fetchData, processData } from '../services/WebScrapingService';

jest.mock('../services/WebScrapingService', () => ( {
    fetchData: jest.fn(),
    processData: jest.fn(),
} ));

jest.mock('../services/DatabaseService', () => ( {
    saveAllDataToDatabase: jest.fn(),
    getFilteredData: jest.fn(),
} ));

describe('syncData integration test', () => {
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
        ( fetchData as jest.Mock ).mockResolvedValue(fakeData);
        ( processData as jest.Mock ).mockResolvedValue(processedFakeData);
        ( saveAllDataToDatabase as jest.Mock ).mockResolvedValue(true);

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
        ( fetchData as jest.Mock ).mockRejectedValue(new Error('Web scraping inicial falhou, não retornou dados válidos'));

        const response = await request(app).get('/notebook/sync?chunkSize=100');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Erro ao acessar a página web');
    });
});

describe('getProducts integration test', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Deve buscar no banco de dados os items do filtro e retornar', async () => {
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
        ( getFilteredData as jest.Mock ).mockResolvedValue(fakeResponse);

        const fakeFilteredData = { filter: 'Lenovo', orderBy: 'ASC' };

        // Fazendo a requisição
        const res = await request(app).get(`/notebook/get?item=${fakeFilteredData.filter}&orderBy=${fakeFilteredData.orderBy}`);
        // Verificando se a função foi chamada corretamente e a posição
        expect(getFilteredData).toHaveBeenCalledWith('Lenovo', 'ASC');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeResponse);
    });
});
