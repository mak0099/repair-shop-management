import { RegisterLog } from "../register.schema";
import { REGISTER_STATUS } from "../register.constants";

export const mockRegisters: RegisterLog[] = [
  {
    id: "reg-101",
    sessionNumber: "REG-2024-001",
    openedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    closedAt: new Date(Date.now() - 64800000).toISOString(),
    openedBy: "Arif (Admin)",
    closedBy: "Arif (Admin)",
    openingBalance: 5000,
    expectedBalance: 12500,
    actualBalance: 12500,
    totalCashSales: 7500,
    totalCardSales: 2000,
    totalDigitalSales: 1500,
    totalExpenses: 0,
    status: REGISTER_STATUS.CLOSED,
    notes: "Perfectly reconciled.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 64800000).toISOString(),
  },
  {
    id: "reg-102",
    sessionNumber: "REG-2024-002",
    openedAt: new Date().toISOString(), // Today's Open Session
    openedBy: "Staff-01",
    openingBalance: 2000,
    expectedBalance: 2000,
    totalCashSales: 4500,
    totalCardSales: 1200,
    totalDigitalSales: 800,
    totalExpenses: 0,
    status: REGISTER_STATUS.OPEN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];