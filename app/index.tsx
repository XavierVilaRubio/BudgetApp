import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import TransactionsList from '../components/TransactionsList';
import { getCategories, getOrderedTransactions } from '../lib/db';
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
    setCategories(await getCategories(db));
    setTransactions(await getOrderedTransactions(db));
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4 pt-6 flex-1 bg-slate-50">
        <TransactionsList categories={categories} transactions={transactions} />
      </View>
    </SafeAreaView>
  );
}
