import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import TransactionsList from '../components/TransactionsList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Category, Transaction, TransactionsByMonth } from '../lib/types';

export default function Page() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] = React.useState<TransactionsByMonth>({
    totalExpenses: 0,
    totalIncome: 0,
  });

  const db = useSQLiteContext();

  React.useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db]);

  async function getData() {
    const categoriesResult = await db.getAllAsync<Category>(`SELECT * FROM Categories;`);
    setCategories(categoriesResult);

    const transactionsResult = await db.getAllAsync<Transaction>(
      `SELECT * FROM Transactions ORDER BY date DESC;`
    );
    setTransactions(transactionsResult);

    const now = new Date();
    const monthFirstDay = new Date(now.getFullYear(), now.getMonth() - 1);
    const monthLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    monthLastDay.setMilliseconds(monthLastDay.getMilliseconds() - 1);

    const monthFirstDayTimestamp = Math.floor(monthFirstDay.getTime() / 1000);
    const monthLastDayTimestamp = Math.floor(monthLastDay.getTime() / 1000);

    const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM Transactions
      WHERE date >= ? AND date <= ?;
    `,
      [monthFirstDayTimestamp, monthLastDayTimestamp]
    );
    setTransactionsByMonth(transactionsByMonth[0]);
  }

  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await getData();
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <TransactionsList
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
        ListHeaderComponent={
          <MonthSummaryCard
            totalExpenses={transactionsByMonth.totalExpenses}
            totalIncome={transactionsByMonth.totalIncome}
          />
        }
      />
    </SafeAreaView>
  );
}

function MonthSummaryCard(transactionsByMonth: TransactionsByMonth) {
  const readablePeriod = new Date().toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });
  const savings = transactionsByMonth.totalIncome - transactionsByMonth.totalExpenses;
  const color = savings > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="my-4">
      <CardHeader className="pb-0">
        <CardTitle>Summary for {readablePeriod}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text className="text-lg">
          Income:{' '}
          <Text className="font-semibold text-green-500">${transactionsByMonth.totalIncome}</Text>
        </Text>
        <Text className="text-lg">
          Total Expenses:{' '}
          <Text className="font-semibold text-red-500">${transactionsByMonth.totalExpenses}</Text>
        </Text>
        <Text className="text-lg">
          Savings: <Text className={`font-semibold ${color}`}>${savings}</Text>
        </Text>
      </CardContent>
    </Card>
  );
}
