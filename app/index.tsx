import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet';
import { useSQLiteContext } from 'expo-sqlite/next';
import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import { BottomSheetCalendar } from '../components/NewTransactionBottomSheet';
import TransactionsList from '../components/TransactionsList';
import { Button } from '../components/ui/button';
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

  async function insertTransaction(transaction: Transaction) {
    db.withTransactionAsync(async () => {
      const res = await db.runAsync(
        `
        INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
      `,
        [
          transaction.category_id,
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
        ]
      );
      console.log(res);
      await getData();
    });
  }

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const handleSnapPress = useCallback((index: number) => {
    console.log(bottomSheetRef);
    bottomSheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  function onCloseBottomSheet() {
    setIsOpen(false);
    bottomSheetRef.current?.close();
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
            onPressNewEntry={() => handleSnapPress(0)}
          />
        }
      />
      <BottomSheetCalendar
        ref={bottomSheetRef}
        onClose={onCloseBottomSheet}
        insertTransaction={insertTransaction}
      />
    </SafeAreaView>
  );
}

function MonthSummaryCard({
  totalIncome,
  totalExpenses,
  onPressNewEntry,
}: {
  totalIncome: TransactionsByMonth['totalIncome'];
  totalExpenses: TransactionsByMonth['totalExpenses'];
  onPressNewEntry: () => void;
}) {
  const readablePeriod = new Date().toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });
  const savings = totalIncome - totalExpenses;
  const color = savings > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <View className="my-4 gap-4">
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Summary for {readablePeriod}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-lg">
            Income: <Text className="font-semibold text-green-500">${totalIncome}</Text>
          </Text>
          <Text className="text-lg">
            Total Expenses: <Text className="font-semibold text-red-500">${totalExpenses}</Text>
          </Text>
          <Text className="text-lg">
            Savings: <Text className={`font-semibold ${color}`}>${savings}</Text>
          </Text>
        </CardContent>
      </Card>
      <Button className="flex-row gap-1" onPress={onPressNewEntry}>
        <MaterialIcons name="add-circle-outline" size={20} color="white" />
        <Text className="text-white font-semibold">New Entry</Text>
      </Button>
    </View>
  );
}
