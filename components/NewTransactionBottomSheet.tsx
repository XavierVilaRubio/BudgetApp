import BottomSheet, {
  BottomSheetProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
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

  const [form, setForm] = React.useState<TransactionWithoutId>({
    amount: 0,
    description: '',
    category_id: 1,
    date: new Date().getTime() / 1000,
    type: 'Expense',
  });
  const db = useSQLiteContext();

  async function getExpenseType(currentTab: number) {
    const type = currentTab === 0 ? 'Expense' : 'Income';
    setForm((prev) => ({ ...prev, type }));

    const result = await db.getAllAsync<Category>(`SELECT * FROM Categories WHERE type = ?;`, [
      type,
    ]);
    setCategories(result);
  }

  function resetForm() {
    setForm((prev) => ({
      ...prev,
      amount: 0,
      description: '',
      category_id: 1,
      type: 'Expense',
    }));
    setCurrentTab(0);
  }

  async function handleSave() {
    console.log(JSON.stringify(form, null, 2));

    await props.insertTransaction(form);
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
      onClose={() => resetForm()}
      {...props}>
      <View style={{ flex: 1 }} className="mx-6 gap-2 pb-6">
        <Text className="text-3xl font-bold">New Transaction</Text>
        <Input
          placeholder="Amount"
          style={{ fontSize: 24, fontWeight: 'bold' }}
          className="text-3xl font-bold"
          keyboardType="numeric"
          value={form.amount === 0 ? '' : form.amount.toString()}
          onChangeText={(text) => {
            // Remove any non-numeric characters before setting the state
            const numericValue = text.replace(/[^0-9.]/g, '');
            setForm((prev) => ({ ...prev, amount: Number(numericValue) }));
          }}
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
        />
        <SegmentedControl
          values={['Expense', 'Income']}
          style={{ marginBottom: 15 }}
          selectedIndex={currentTab}
          onChange={onChangeExpenseTab}
        />
        <BottomSheetScrollView style={{ flex: 1 }} className="-mx-6 px-6">
          <FlashList
            data={categories}
            extraData={form.category_id}
            renderItem={({ item }) => {
              const isSelected = form.category_id === item.id;
              return (
                <Button
                  onPress={() => setForm((prev) => ({ ...prev, category_id: item.id }))}
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
