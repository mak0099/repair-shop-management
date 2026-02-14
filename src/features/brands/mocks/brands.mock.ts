import { Brand } from "../brand.schema"

const brandData = [
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Huawei", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Huawei.svg/200px-Huawei.svg.png" },
  { name: "Xiaomi", logo: null },
  { name: "Oppo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/OPPO_Logo.svg/200px-OPPO_Logo.svg.png" },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "OnePlus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/OnePlus_logo.svg/200px-OnePlus_logo.svg.png" },
  { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/200px-Sony_logo.svg.png" },
  { name: "Nokia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Nokia_wordmark.svg/200px-Nokia_wordmark.svg.png" },
  { name: "Motorola", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Motorola_logo.svg/200px-Motorola_logo.svg.png" },
  { name: "LG", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LG_logo_%282014%29.svg/200px-LG_logo_%282014%29.svg.png" },
  { name: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Asus_logo.svg/200px-Asus_logo.svg.png" },
  { name: "Realme", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Realme_logo.svg/200px-Realme_logo.svg.png" },
  { name: "Vivo", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Vivo_logo_2019.svg/200px-Vivo_logo_2019.svg.png" },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.svg/200px-Lenovo_Global_Corporate_Logo.svg.png" },
];

const generateBrands = (count: number): Brand[] => {
  const brands: Brand[] = [];
  for (let i = 0; i < count; i++) {
    const brandInfo = brandData[i % brandData.length];
    const isDuplicate = i >= brandData.length;
    brands.push({
      id: `brand-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${brandInfo.name} ${Math.floor(i / brandData.length) + 1}` : brandInfo.name,
      logo: brandInfo.logo,
      isActive: i % 7 !== 0, // Make some inactive for variety
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return brands;
};

export const mockBrands: Brand[] = generateBrands(25);