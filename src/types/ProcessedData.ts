export interface ProcessedData {
    title: string;
    link: string;
    description: string;
    swatchesPrices: StorageData[];
    reviewCount: number;
    starCount: number;
}

export interface StorageData {
    price: number;
    capacity: number;
}