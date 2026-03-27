import { Item } from "./item.schema";

/**
 * Maps UI attribute names to our flat schema keys.
 * This ensures "RAM" from the generator becomes "ram" in the database.
 */
const ATTRIBUTE_MAP: Record<string, keyof Item> = {
  RAM: "ram",
  ROM: "rom",
  Color: "color",
  Size: "size",
};

/**
 * Generates a slug-friendly SKU based on product name and attributes.
 */
export const generateSKU = (productName: string, attributes: Record<string, string>): string => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const attrValues = Object.values(attributes)
    .map((val) => val.substring(0, 3).replace(/\s/g, "").toUpperCase())
    .join("-");
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${attrValues}-${randomSuffix}`;
};

/**
 * Creates a Cartesian Product of attributes to generate all possible combinations.
 */
export const generateCartesianProduct = (entries: [string, string[]][]): Record<string, string>[] => {
  return entries.reduce<Record<string, string>[]>(
    (results, [key, values]) => {
      const newResults: Record<string, string>[] = [];
      results.forEach((result) => {
        values.forEach((value) => {
          newResults.push({ ...result, [key]: value });
        });
      });
      return newResults;
    },
    [{}]
  );
};

/**
 * Transforms attribute selections into an initial array of Items (Partial).
 */
export const createVariantsFromAttributes = (
  productName: string,
  selectedAttributes: Record<string, string[]>,
  basePrices: { purchase: number; sale: number } = { purchase: 0, sale: 0 }
): Partial<Item>[] => {
  const attributeEntries = Object.entries(selectedAttributes);
  const combinations = generateCartesianProduct(attributeEntries);

  return combinations.map((combination) => {
    // Start with basic product data
    const itemData: Partial<Item> = {
      name: `${productName} (${Object.values(combination).join("/")})`,
      sku: generateSKU(productName, combination),
      purchasePrice: basePrices.purchase,
      salePrice: basePrices.sale,
      isActive: true,
      condition: "Used",
    };

    // Dynamically map combinations (RAM, ROM, etc.) to the flat schema keys
    Object.entries(combination).forEach(([attrName, attrValue]) => {
      const schemaKey = ATTRIBUTE_MAP[attrName];
      if (schemaKey) {
        // We use type assertion here to tell TS that this specific key is valid
        (itemData[schemaKey] as string) = attrValue;
      }
    });

    return itemData;
  });
};