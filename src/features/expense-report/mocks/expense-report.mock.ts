import { Expense } from "../expense-report.schema";

export const expenseReportMock: Expense[] = [
  {
    id: "exp-001",
    date: "2024-05-01",
    category: "Office Supplies",
    description: "A4 paper ream",
    amount: 550,
  },
  {
    id: "exp-002",
    date: "2024-05-03",
    category: "Utilities",
    description: "Internet Bill",
    amount: 1200,
  },
  {
    id: "exp-003",
    date: "2024-05-05",
    category: "Miscellaneous",
    description: "Snacks for office",
    amount: 750,
  },
];