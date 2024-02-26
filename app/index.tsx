import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';
import { SafeAreaView, View } from 'react-native';

import TransactionsList from '../components/TransactionsList';
import { Category, Transaction } from '../lib/types';

export default function Page() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

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
  }

  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await getData();
    });
  }

  return (
    <SafeAreaView className="flex-1">
      <TransactionsList
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
    </SafeAreaView>
  );
}
