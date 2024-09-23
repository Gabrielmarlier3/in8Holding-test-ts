export interface IProcessedData {
    title: string;
    link: string;
    description: string;
    swatchesPrices: IStorageData[];
    reviewCount: number;
    starCount: number;
}

export interface IStorageData {
    price: number;
    capacity: number;
}