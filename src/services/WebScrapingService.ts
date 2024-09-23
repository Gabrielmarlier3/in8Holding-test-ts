import 'dotenv/config';
import axios from 'axios';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';
import { filterExistingLinks, getAllData } from './DatabaseService';
import { IScrapeData } from '../types/IScrapeData';
import { IProcessedData, IStorageData } from '../types/IProcessedData';

/**
 * Função para buscar dados da página de laptops
 * @returns {Promise<IScrapeData[]>} - Array de objetos ScrapeData
 */
const fetchData = async (): Promise<IScrapeData[]> => {
    try {
        // Faz uma requisição inicial para obter os links das páginas
        const initialRes = await axios.get('https://webscraper.io/test-sites/e-commerce/static/computers/laptops');
        if ( !initialRes.data ) {
            throw new Error('Web scraping inicial falhou, não retornou dados válidos');
        }
        const $initial = load(initialRes.data);

        // Coleta o número das páginas para percorrer todas
        const pageNumbers: number[] = [];
        $initial('li.page-item a.page-link').each(( index: number, element ) => {
            const pageNumber = parseInt($initial(element).text(), 10);
            if ( !isNaN(pageNumber) ) {
                pageNumbers.push(pageNumber);
            }
        });

        const maxPageNumber = Math.max(...pageNumbers);
        const requests = [];

        // Faz uma requisição para cada página
        for ( let i = 1; i <= maxPageNumber; i++ ) {
            requests.push(axios.get(`https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=${i}`));
        }

        // Aguarda a resposta de todas as páginas e concatena os dados
        const responses = await Promise.all(requests);
        const html = responses.map(response => {
            if ( !response.data ) {
                throw new Error('Resposta de página inválida');
            }
            return response.data;
        }).join('');
        const $ = load(html);

        // Mapeia os dados coletados em um array de ScrapeData
        const data: IScrapeData[] = [];
        $('a.title').each(( index: number, element ) => {
            data.push({
                title: $(element).attr('title') || '',
                link: $(element).attr('href') || '',
            });
        });
        //Isso filtra todos os links que já existem no banco de dados, passando apenas os novos

        return await filterExistingLinks(data);
    } catch (error) {
        console.error('Erro ao buscar os dados de laptops:', error);
        throw new Error('Erro ao buscar os dados de laptops');
    }
};

/**
 * Função para processar os dados coletados e extrair informações detalhadas usando Puppeteer
 * @param {IScrapeData[]} data - Array de dados coletados
 * @param {number} [chunkSize=30] - Tamanho do chunk para limitar requisições simultâneas
 * @returns {Promise<IProcessedData[]>} - Array de objetos ProcessedData
 */
const processData = async ( data: IScrapeData[], chunkSize: number = 30 ): Promise<IProcessedData[]> => {
    const results: IProcessedData[] = [];
    const ramUse = 3000;

    try {
        // Pega os dados existentes no banco de dados para evitar duplicatas
        const processedData = await getAllData();
        const processedLinks = new Set(processedData.map(( item: { link: string } ) => item.link));

        // Filtra os dados que ainda não foram processados
        const unprocessedData = data.filter(item => {
            const url = `https://webscraper.io${item.link}`;
            return !processedLinks.has(url);
        });

        // Processa os dados em chunks para não sobrecarregar o Puppeteer
        for ( let i = 0; i < unprocessedData.length; i += chunkSize ) {
            const chunk = unprocessedData.slice(i, i + chunkSize);

            const pageDataPromises = chunk.map(async ( item ) => {
                const url = `https://webscraper.io${item.link}`;
                const res = await axios.get(url);
                const $ = load(res.data);

                const swatchesPrices: IStorageData[] = [];
                const ramUsePerTab = ramUse / chunk.length;

                // Inicializa o navegador com Puppeteer
                const browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        `--max-old-space-size=${ramUsePerTab}`,
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-software-rasterizer'
                    ]
                });

                const page = await browser.newPage();
                await page.goto(url);

                // Pega os botões de capacidade e seus preços
                const swatches = await page.$$eval('.swatches button:not([disabled])', ( buttons: Element[] ) => buttons.map(btn => ( {
                    capacity: parseInt(( btn as HTMLButtonElement ).value, 10),
                    isActive: ( btn as HTMLButtonElement ).classList.contains('active')
                } )));

                const description = $('p.description.card-text').text().trim();

                // Coleta o preço conforme a capacidade
                for ( const swatch of swatches ) {
                    await page.click(`.swatches button[value="${swatch.capacity}"]`);
                    await page.waitForSelector('.price.float-end.pull-right');
                    const price = await page.$eval('.price.float-end.pull-right', ( el: Element ) => {
                        const text = el.textContent?.trim().replace('$', '');
                        return text ? parseFloat(text) : 0;
                    });
                    swatchesPrices.push({ capacity: swatch.capacity, price });
                }

                await browser.close();

                // Coleta o número de avaliações e a quantidade de estrelas
                let reviewCount = 0;
                let starCount = 0;
                try {
                    const reviewText = $('.ratings .review-count').text().trim();
                    reviewCount = parseInt(reviewText.match(/\d+/)?.[0] || '0', 10);
                    starCount = $('.ratings .ws-icon.ws-icon-star').length;
                } catch (error) {
                    console.error('Erro ao processar reviews/estrelas:', error);
                }

                return {
                    title: item.title,
                    link: item.link,
                    description,
                    swatchesPrices,
                    reviewCount,
                    starCount
                };
            });

            const pageData = await Promise.all(pageDataPromises);
            results.push(...pageData);
        }

        return results;
    } catch (error) {
        console.error('Erro ao processar os dados:', error);
        throw new Error('Erro ao processar os dados');
    }
};

export { fetchData, processData };
