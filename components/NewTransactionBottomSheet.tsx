import BottomSheet, { BottomSheetProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import SegmentedControl, {
  NativeSegmentedControlIOSChangeEvent,
} from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import { useSQLiteContext } from 'expo-sqlite/next';
import React, { forwardRef, useMemo } from 'react';
import { NativeSyntheticEvent, Text, View } from 'react-native';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Category, TransactionWithoutId } from '../lib/types';

let didInit = false;

export const BottomSheetCalendar = forwardRef<
  BottomSheet,
  Partial<BottomSheetProps> & {
    insertTransaction: (transaction: TransactionWithoutId) => Promise<void>;
  }
>(function BottomSheetCalendar(props, ref) {
  const snapPoints = useMemo(() => ['80%'], []);

  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = React.useState<Category['type']>('Expense');
  const [amount, setAmount] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [categoryId, setCategoryId] = React.useState<number>(1);
  const db = useSQLiteContext();

  async function getExpenseType(currentTab: number) {
    const type = currentTab === 0 ? 'Expense' : 'Income';
    setTypeSelected(type);

    const result = await db.getAllAsync<Category>(`SELECT * FROM Categories WHERE type = ?;`, [
      type,
    ]);
    setCategories(result);
  }

  function resetForm() {
    setAmount('');
    setDescription('');
    setCategoryId(1);
    setTypeSelected('Expense');
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
          type: typeSelected,
        },
        null,
        2
      )
    );

    await props.insertTransaction({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime() / 1000,
      type: typeSelected,
    });
    resetForm();
    if (props.onClose) props.onClose();
  }

  function onChangeExpenseTab(event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) {
    const currentTab = event.nativeEvent.selectedSegmentIndex;
    setCurrentTab(currentTab);
    getExpenseType(currentTab);
  }

  if (!didInit) {
    didInit = true;
    getExpenseType(currentTab);
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
          onChange={onChangeExpenseTab}
        />
        <BottomSheetScrollView style={{ flex: 1 }} className="-mx-6 px-6">
          <FlashList
            data={categories}
            extraData={categoryId}
            renderItem={({ item }) => {
              const isSelected = categoryId === item.id;
              return (
                <Button
                  onPress={() => setCategoryId(item.id)}
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
