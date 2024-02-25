import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import TransactionListItem from './TransactionListItem';
import { Category, Transaction } from '../lib/types';

export default function TransactionsList({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: Category[];
}) {
  return (
    <FlashList
      data={transactions}
      renderItem={({ item: transaction }: { item: Transaction }) => {
        const currentItemCategory = categories.find(
          (category) => category.id === transaction.category_id
        );
        return (
          <View className="mb-4">
            <TransactionListItem transaction={transaction} categoryInfo={currentItemCategory} />
          </View>
        );
      }}
      estimatedItemSize={80}
    />
  );
}
