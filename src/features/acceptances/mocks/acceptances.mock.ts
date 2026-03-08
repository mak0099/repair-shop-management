import { Acceptance } from "../acceptance.schema";
import { mockCustomers } from "@/features/customers/mocks/customers.mock";
import { mockBrands } from "@/features/brands/mocks/brands.mock";
import { mockModels } from "@/features/models/mocks/models.mock";
import { mockUsers } from "@/features/users/mocks/users.mock";
import { mockMasterSettings } from "@/features/master-settings/mocks/master-setting.mock";

const getMasterValues = (key: string) => {
    const setting = mockMasterSettings.find(s => s.key === key);
    return setting ? setting.values.map(v => v.value) : [];
};

const deviceTypes = getMasterValues("DEVICE_TYPE");
const statuses = getMasterValues("REPAIR_STATUS");
const warranties = getMasterValues("WARRANTY");
const colors = getMasterValues("COLOR");
const accessories = getMasterValues("ACCESSORY");

const booleans = [true, false];
const defects = [
    "Screen is cracked and touch not responding in lower half.",
    "Battery draining very fast, needs replacement.",
    "Phone not turning on, possible motherboard issue.",
    "Water damage, device is not responsive.",
    "Charging port is loose and not charging properly.",
    "Camera is blurry and out of focus.",
    "Speaker volume is very low.",
];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateAcceptances = (count: number): Acceptance[] => {
    return Array.from({ length: count }).map((_, i) => {
        const customer = getRandom(mockCustomers);
        const brand = getRandom(mockBrands);
        const model = getRandom(mockModels.filter(m => m.brand_id === brand.id)) || getRandom(mockModels);
        const technician = getRandom(mockUsers);
        const urgent = getRandom(booleans);
        const pinUnlock = getRandom(booleans);
        // Date generated here
        const dateObj = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        return {
            id: `rec-${100 + i}`,
            acceptanceNumber: `${41604 + i}-2026`,
            customerId: customer.id,
            brandId: brand.id,
            modelId: model.id,
            technicianId: technician.id,
            // Fixed field name: matching Acceptance interface
            acceptanceDate: dateObj, 
            estimatedPrice: Math.floor(Math.random() * 451) + 50,
            color: getRandom(colors),
            accessories: getRandom(accessories),
            deviceType: getRandom(deviceTypes),
            currentStatus: getRandom(statuses),
            defectDescription: getRandom(defects),
            notes: "Customer seems to be in a hurry. Please prioritize.",
            imei: String(Math.floor(1e14 + Math.random() * 9e14)),
            secondaryImei: Math.random() > 0.8 ? String(Math.floor(1e14 + Math.random() * 9e14)) : "",
            warranty: getRandom(warranties),
            importantInformation: getRandom(booleans),
            pinUnlock: pinUnlock,
            pinUnlockNumber: pinUnlock ? Math.floor(1000 + Math.random() * 9000).toString() : "",
            urgent: urgent,
            urgentDate: urgent ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
            quote: getRandom(booleans),
            photos: i % 3 === 0 ? ["/mock/iphone-front.jpg", "/mock/iphone-back.jpg"] : [],
            createdAt: dateObj.toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            priceOffered: Math.random() > 0.9 ? Math.floor(Math.random() * 200) : 0,
            dealer: "",
            replacementDeviceId: "",
            reservedNotes: ""
        };
    });
};

export const mockAcceptances: Acceptance[] = generateAcceptances(45);