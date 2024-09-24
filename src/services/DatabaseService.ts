import { Op, Sequelize } from 'sequelize';
import ProductModel from '../models/ProductModel';
import { IProcessedData } from '../types/IProcessedData';
import { IScrapeData } from "../types/IScrapeData";

async function ensureProductsTableExists(): Promise<void>{
    await ProductModel.sync();
}

async function saveAllDataToDatabase(data: IProcessedData[]): Promise<void>{
    await ensureProductsTableExists();

    const insertPromises = data.map(async (item) => {
        const [product, created] = await ProductModel.findOrCreate({
            where: { title: item.title, link: item.link },
            defaults: {
                description: item.description,
                swatchesPrices: item.swatchesPrices,
                reviewCount: item.reviewCount || 0,
                starCount: item.starCount || 0,
            },
        });

        if ( !created ) {
            await product.update({
                description: item.description,
                swatchesPrices: item.swatchesPrices,
                reviewCount: item.reviewCount || 0,
                starCount: item.starCount || 0,
            });
        }
    });

    await Promise.all(insertPromises);
}

async function getFilteredData(itemFilter: string, orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<ProductModel[]>{
    await ensureProductsTableExists();

    return await ProductModel.findAll({
        where: {
            title: {
                [Op.like]: `%${itemFilter}%`,
            },
        },
        order: [[Sequelize.literal('CAST(JSON_UNQUOTE(JSON_EXTRACT(swatchesPrices, \'$[0].price\')) AS DECIMAL(10,2))'), orderBy]],
    });
}

async function filterExistingLinks(data: IScrapeData[]): Promise<IScrapeData[]>{
    await ensureProductsTableExists();  // Verifica se a tabela existe ou é criada
    const existingLinks = await ProductModel.findAll({
        where: {
            link: {
                [Op.in]: data.map(item => item.link),
            },
        },
    });

    const existingLinksSet = new Set(existingLinks.map(item => item.link));

    return data.filter(item => !existingLinksSet.has(item.link));
}

export { saveAllDataToDatabase, getFilteredData, filterExistingLinks, ensureProductsTableExists };