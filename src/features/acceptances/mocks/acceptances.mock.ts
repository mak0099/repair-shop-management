import { Acceptance } from "../acceptance.schema";
import { mockCustomers } from "@/features/customers/mocks/customers.mock";
import { mockBrands } from "@/features/brands/mocks/brands.mock";
import { mockModels } from "@/features/models/mocks/models.mock";
import { mockUsers } from "@/features/users/mocks/users.mock";

const deviceTypes = ["SMARTPHONE", "TABLET", "LAPTOP", "DESKTOP", "OTHER"];
const statuses = ["IN REPAIR", "WAITING PARTS", "READY", "DELIVERED", "CANCELLED"];
const warranties = ["No Warranty", "3 Months", "6 Months", "12 Months", "Lifetime"];
const yesNo: ("Yes" | "No")[] = ["Yes", "No"];
const colors = ["Black", "White", "Titanium Gray", "Blue", "Red", "Green"];
const accessories = ["Charger", "Cable", "Case", "No accessories", "Original Box"];
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
        const urgent = getRandom(yesNo);
        const pinUnlock = getRandom(yesNo);
        // Date generated here
        const dateObj = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        return {
            id: `rec-${100 + i}`,
            acceptance_number: `${41604 + i}-2026`,
            customer_id: customer.id,
            brand_id: brand.id,
            model_id: model.id,
            technician_id: technician.id,
            // Fixed field name: matching Acceptance interface
            acceptance_date: dateObj, 
            estimated_price: Math.floor(Math.random() * 451) + 50,
            color: getRandom(colors),
            accessories: getRandom(accessories),
            device_type: getRandom(deviceTypes),
            current_status: getRandom(statuses),
            defect_description: getRandom(defects),
            notes: "Customer seems to be in a hurry. Please prioritize.",
            imei: String(Math.floor(1e14 + Math.random() * 9e14)),
            secondary_imei: Math.random() > 0.8 ? String(Math.floor(1e14 + Math.random() * 9e14)) : "",
            warranty: getRandom(warranties),
            important_information: getRandom(yesNo),
            pin_unlock: pinUnlock,
            pin_unlock_number: pinUnlock === "Yes" ? Math.floor(1000 + Math.random() * 9000).toString() : "",
            urgent: urgent,
            urgent_date: urgent === "Yes" ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
            quote: getRandom(yesNo),
            photos: i % 3 === 0 ? ["/mock/iphone-front.jpg", "/mock/iphone-back.jpg"] : [],
            branch_id: "roma-main",
            createdAt: dateObj.toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            price_offered: Math.random() > 0.9 ? Math.floor(Math.random() * 200) : 0,
            dealer: "",
            replacement_device_id: "",
            reserved_notes: ""
        };
    });
};

export const mockAcceptances: Acceptance[] = generateAcceptances(45);