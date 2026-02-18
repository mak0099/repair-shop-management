import { Brand } from "../brand.schema";

export const mockBrands: Pick<Brand, "id" | "name">[] = [
    { id: 'brand-apple', name: 'Apple' },
    { id: 'brand-samsung', name: 'Samsung' },
    { id: 'brand-google', name: 'Google' },
    { id: 'brand-huawei', name: 'Huawei' },
];