import { SaleItem } from "../sale-report.schema";

export const saleReportMock: SaleItem[] = [
  {
    id: "sale-001",
    date: "2024-05-02",
    invoiceNumber: "INV-2024-1001",
    customerName: "John Doe",
    totalAmount: 1500,
    profit: 300,
  },
  {
    id: "sale-002",
    date: "2024-05-04",
    invoiceNumber: "INV-2024-1002",
    customerName: "Jane Smith",
    totalAmount: 2500,
    profit: 550,
  },
  {
    id: "sale-003",
    date: "2024-05-06",
    invoiceNumber: "INV-2024-1003",
    customerName: "Peter Jones",
    totalAmount: 800,
    profit: 150,
  },
];