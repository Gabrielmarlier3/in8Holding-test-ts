import ProductModel from '../models/ProductModel';
import { ensureProductsTableExists, filterExistingLinks, getAllData, getFilteredData } from '../services/DatabaseService';
import sequelize from "../config/database";
import { Model } from "sequelize";

jest.mock('../services/DatabaseService', () => {
    const actualModule = jest.requireActual('../services/DatabaseService');
    return {
        //consigo assim mockar somente as funçoes que preciso
        ...actualModule,
        getFilteredData: jest.fn().mockResolvedValue([
            {
                title: 'Teste',
                link: 'http://teste.com',
                description: 'Teste',
                swatchesPrices: 'Teste',
                reviewCount: 0,
                starCount: 0,
            }
        ]),
    };
});

describe('Conjunto de teste no DatabaseService', () => {
    beforeAll(async () => {
        await ProductModel.sync();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('deve garantir que a função ensureProductsTableExists funciona como o esperado', async () => {
        // Isso cria a resposta que o ensureProductsTableExists deve retornar apesar do retorno ser void
        const syncMock = jest.spyOn(ProductModel, 'sync').mockResolvedValue(ProductModel as unknown as Model<any, any>);

        await ensureProductsTableExists();

        // Verifica se ProductModel.sync foi chamado
        expect(syncMock).toHaveBeenCalled();

        // Limpa o mock após o teste
        syncMock.mockRestore();
    });

    it('Verifica se getFilteredData retorna os dados corretos', async () => {
        const data = await getFilteredData('Teste', 'ASC');

        expect(getFilteredData).toHaveBeenCalledWith('Teste', 'ASC');
        expect(data).not.toBeNull();
    });

    it('Verifica se getAllData retorna os dados corretos', async () => {
        const mockData = [
            {
                title: 'Teste',
                link: 'http://teste.com',
                description: 'Teste',
                swatchesPrices: 'Teste',
                reviewCount: 0,
                starCount: 0,
            },
            {
                title: 'Teste1',
                link: 'http://teste1.com',
                description: 'Teste1',
                swatchesPrices: 'Teste1',
                reviewCount: 1,
                starCount: 1,
            },

        ];

        const dataMock = jest.spyOn(ProductModel, 'findAll').mockResolvedValue(mockData as any);

        const result = await getAllData();

        expect(dataMock).toHaveBeenCalled();

        expect(result).toEqual(mockData);
        expect(Array.isArray(result)).toBe(true);

        dataMock.mockRestore();
    });

    it('Verifica se filterExistingLinks retorna os dados corretos', async () => {
        const scrapeData = [
            { title: 'Teste', link: 'http://teste.com' },
            { title: 'Teste1', link: 'http://teste1.com' }
        ];

        const data = await filterExistingLinks(scrapeData);

        expect(data).not.toBeNull();
        // Se o link não existir, deve retornar o mesmo array
        expect(data).toEqual(scrapeData);
    });


});