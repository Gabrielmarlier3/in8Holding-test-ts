import { fetchData, processData } from "../services/WebScrapingService";

jest.setTimeout(30000);

describe('Conjunto de teste no WebScrapingService', () => {
    it('Verifica se fetchData retorna os dados corretos', async () => {

        const data = await fetchData();

        expect(Array.isArray(data)).toBe(true);
        expect(data).not.toBeNull();
    });

    it('Verifica se processData retorna os dados processados corretamente', async () => {
        const inputData = [
            { title: 'Packard 255 G2', link: '/test-sites/e-commerce/static/product/31' },
            { title: 'Aspire E1-510', link: '/test-sites/e-commerce/static/product/32' }
        ];

        const result = await processData(inputData);

        expect(Array.isArray(result)).toBe(true);
        expect(result).not.toBeNull();
        expect(result.length).toBe(2);
    });
});
