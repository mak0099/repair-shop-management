import { Model } from "../model.schema";

export const mockModels: (Pick<Model, "id" | "name"> & { brand_id: string })[] = [
    { id: 'model-iphone-15', name: 'iPhone 15 Pro', brand_id: 'brand-apple' },
    { id: 'model-galaxy-s23', name: 'Galaxy S23', brand_id: 'brand-samsung' },
    { id: 'model-pixel-8', name: 'Pixel 8', brand_id: 'brand-google' },
    { id: 'model-p60', name: 'P60 Pro', brand_id: 'brand-huawei' },
    { id: 'model-iphone-14', name: 'iPhone 14', brand_id: 'brand-apple' },
    { id: 'model-galaxy-a54', name: 'Galaxy A54', brand_id: 'brand-samsung' },
];