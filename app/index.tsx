import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite/next';
import React from 'react';
import { Text, View } from 'react-native';

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
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Overview' }} />
      <View className={styles.main}>
        <View>
          <Text className={styles.title}>Hello World</Text>
          <Text className={styles.subtitle}>This is the first page of your app.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 p-6',
  main: 'flex-1 max-w-[960] justify-between',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
