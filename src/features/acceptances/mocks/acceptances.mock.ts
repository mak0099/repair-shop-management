import { Acceptance } from "../acceptance.schema";


export const mockAcceptances: Acceptance[] = [
  {
    id: "rec-001",
    acceptance_number: "41604-2026",
    customer_name: "Mario Rossi",
    estimated_price: 150,
    brand: "Apple",
    model: "iPhone 15 Pro",
    color: "Titanium Gray",
    accessories: "Original Box, No Charger",
    device_type: "SMARTPHONE",
    current_status: "IN REPAIR",
    defect_description: "Screen is cracked and touch not responding in lower half.",
    notes: "Minor scratches on the back panel.",
    created_date: "2026-02-11T14:00:00Z",
    imei: "354678109234567",
    technician_id: "tech-01",
    warranty: "3 Months",
    important_information: true,
    pin_unlock: true,
    pin_unlock_number: "123456",
    urgent: true,
    urgent_date: "2026-02-12",
    quote: false,
    photos: ["/mock/iphone-front.jpg", "/mock/iphone-back.jpg"],
    branch_id: "roma-main"
  },
  {
    id: "rec-002",
    acceptance_number: "41605-2026",
    customer_name: "Giulia Bianchi",
    estimated_price: 85,
    brand: "Samsung",
    model: "Galaxy S23",
    color: "Phantom Black",
    device_type: "SMARTPHONE",
    current_status: "IN REPAIR",
    defect_description: "Battery draining very fast.",
    created_date: "2026-02-11T16:30:00Z",
    imei: "987654321012345",
    technician_id: "tech-02",
    important_information: false,
    pin_unlock: false,
    urgent: false,
    quote: true,
    photos: [],
    branch_id: "roma-main"
  }
];