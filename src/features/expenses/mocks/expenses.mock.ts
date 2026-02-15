import { Expense } from "../expense.schema"

const expenseData = [
  { title: "Office Rent", amount: 1500, date: new Date("2024-01-05"), category_id: "setting-100", branch_id: "branch-100", notes: "Monthly rent for Milano office" },
  { title: "Internet Bill", amount: 80, date: new Date("2024-01-10"), category_id: "setting-101", branch_id: "branch-100", notes: "Fiber internet connection" },
  { title: "New Keyboards", amount: 250, date: new Date("2024-01-15"), category_id: "setting-102", branch_id: "branch-101", notes: "Mechanical keyboards for developers" },
];

const generateExpenses = (count: number): Expense[] => {
  const expenses: Expense[] = [];
  for (let i = 0; i < count; i++) {
    const expenseInfo = expenseData[i % expenseData.length];
    const isDuplicate = i >= expenseData.length;
    expenses.push({
      id: `exp-${String(100 + i).padStart(3, '0')}`,
      title: isDuplicate ? `${expenseInfo.title} #${Math.floor(i / expenseData.length) + 1}` : expenseInfo.title,
      amount: expenseInfo.amount + (isDuplicate ? i*10 : 0),
      date: new Date(expenseInfo.date.getTime() + i * 24*60*60*1000).toISOString(), // make dates different
      category_id: expenseInfo.category_id,
      branch_id: expenseInfo.branch_id,
      notes: expenseInfo.notes,
      attachment_url: i % 3 === 0 ? `https://picsum.photos/seed/${100+i}/200/300` : undefined,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return expenses;
};

export const mockExpenses: Expense[] = generateExpenses(10);
