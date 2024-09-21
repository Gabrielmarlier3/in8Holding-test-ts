import { Op, Sequelize } from 'sequelize';
import ProductModel from '../models/ProductModel';
import { ProcessedData } from '../types/ProcessedData';
import { ScrapeData } from "../types/ScrapeData";

const ensureProductsTableExists = async (): Promise<void> => {
    await ProductModel.sync();
};

const saveAllDataToDatabase = async ( data: ProcessedData[] ): Promise<void> => {
    await ensureProductsTableExists();  // Verifica se a tabela existe ou é criada

    const insertPromises = data.map(async ( item ) => {
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
};

const getFilteredData = async ( itemFilter: string, orderBy: 'ASC' | 'DESC' = 'ASC' ): Promise<ProductModel[]> => {
    await ensureProductsTableExists();

    return await ProductModel.findAll({
        where: {
            title: {
                [Op.like]: `%${itemFilter}%`,
            },
        },
        order: [[Sequelize.literal('CAST(JSON_UNQUOTE(JSON_EXTRACT(swatchesPrices, \'$[0].price\')) AS DECIMAL(10,2))'), orderBy]],
    });
};

const getAllData = async (): Promise<any[]> => {
    await ensureProductsTableExists();

    return await ProductModel.findAll();
};

const filterExistingLinks = async (data: ScrapeData[]): Promise<ScrapeData[]> => {
    return await ProductModel.findAll({
        where: {
            link: {
                [Op.notIn]: data.map(item => item.link),
            },
        },
    });
};

export { saveAllDataToDatabase, getFilteredData, getAllData, filterExistingLinks};