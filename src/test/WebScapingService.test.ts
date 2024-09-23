import { fetchData } from "../services/WebScrapingService";

//todo: terminar esse aqui, e verificar se tem como deixar os outros melhores


describe('Conjunto de teste no WebScrapingService', () => {
    it('Verifica se fetchData retorna os dados corretos', async () => {

        const data = await fetchData();

        expect(Array.isArray(data)).toBe(true);
        expect(data).not.toBeNull();
    });

    it
});
