import BottomSheet, { BottomSheetProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import { useSQLiteContext } from 'expo-sqlite/next';
import React, { forwardRef, useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Category, Transaction } from '../lib/types';

export const BottomSheetCalendar = forwardRef<
  BottomSheet,
  Partial<BottomSheetProps> & {
    insertTransaction: (transaction: Transaction) => Promise<void>;
  }
>(function BottomSheetCalendar(props, ref) {
  const snapPoints = useMemo(() => ['80%'], []);

  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [category, setCategory] = React.useState<string>('Expense');
  const [categoryId, setCategoryId] = React.useState<number>(1);
  const db = useSQLiteContext();

  React.useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  async function getExpenseType(currentTab: number) {
    setCategory(currentTab === 0 ? 'Expense' : 'Income');
    const type = currentTab === 0 ? 'Expense' : 'Income';

    const result = await db.getAllAsync<Category>(`SELECT * FROM Categories WHERE type = ?;`, [
      type,
    ]);
    setCategories(result);
  }

  function resetForm() {
    setAmount('');
    setDescription('');
    setCategory('Expense');
    setCategoryId(1);
    setCurrentTab(0);
  }

  async function handleSave() {
    console.log(
      JSON.stringify(
        {
          amount: Number(amount),
          description,
          category_id: categoryId,
          date: new Date().getTime() / 1000,
          type: category as 'Expense' | 'Income',
        },
        null,
        2
      )
    );

    await props.insertTransaction({
      id: 10000,
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: category as 'Expense' | 'Income',
    });
    resetForm();
    if (props.onClose) props.onClose();
  }

  return (
    <BottomSheet
      index={-1}
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      style={{
        borderRadius: 16,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
      }}
      {...props}
      onClose={() => {
        resetForm();
        if (props.onClose) props.onClose();
      }}>
      <View style={{ flex: 1 }} className="mx-6 gap-2 pb-6">
        <Text className="text-3xl font-bold">New Transaction</Text>
        <Input
          placeholder="Amount"
          style={{ fontSize: 24, fontWeight: 'bold' }}
          className="text-3xl font-bold"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => {
            // Remove any non-numeric characters before setting the state
            const numericValue = text.replace(/[^0-9.]/g, '');
            setAmount(numericValue);
          }}
        />
        <Input placeholder="Description" value={description} onChangeText={setDescription} />
        <SegmentedControl
          values={['Expense', 'Income']}
          style={{ marginBottom: 15 }}
          selectedIndex={currentTab}
          onChange={(event) => {
            setCurrentTab(event.nativeEvent.selectedSegmentIndex);
          }}
        />
        <BottomSheetScrollView style={{ flex: 1 }} className="-mx-6 px-6">
          <FlashList
            data={categories}
            extraData={typeSelected}
            renderItem={({ item }) => {
              const isSelected = typeSelected === item.name;
              return (
                <Button
                  onPress={() => {
                    setTypeSelected(item.name);
                    setCategoryId(item.id);
                  }}
                  variant={isSelected ? 'secondary' : 'outline'}
                  className="mb-2">
                  <Text>{item.name}</Text>
                </Button>
              );
            }}
            estimatedItemSize={50}
          />
        </BottomSheetScrollView>
        <Button onPress={handleSave}>
          <Text className="text-white">Save</Text>
        </Button>
      </View>
    </BottomSheet>
  );
});
