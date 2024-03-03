export interface Transaction {
  id: number;
  category_id: number;
  amount: number;
  date: number;
  description: string;
  type: 'Expense' | 'Income';
}

export type TransactionWithoutId = Omit<Transaction, 'id'>;

export interface Category {
  id: number;
  name: string;
  type: 'Expense' | 'Income';
}

export interface TransactionsByMonth {
  totalExpenses: number;
  totalIncome: number;
}
