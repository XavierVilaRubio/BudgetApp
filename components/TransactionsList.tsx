import { FlashList } from '@shopify/flash-list';
import { Text, TouchableOpacity } from 'react-native';

import TransactionListItem from './TransactionListItem';
import { Category, Transaction } from '../lib/types';

export default function TransactionsList({
  transactions,
  categories,
  deleteTransaction,
  ListHeaderComponent,
}: {
  transactions: Transaction[];
  categories: Category[];
  deleteTransaction: (id: number) => Promise<void>;
  ListHeaderComponent: React.ReactElement;
}) {
  return (
    <FlashList
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      data={transactions}
      renderItem={({ item: transaction }: { item: Transaction }) => {
        const currentItemCategory = categories.find(
          (category) => category.id === transaction.category_id
        );
        return (
          <TouchableOpacity
            className="mb-4"
            activeOpacity={0.7}
            onLongPress={() => deleteTransaction(transaction.id)}>
            <TransactionListItem transaction={transaction} categoryInfo={currentItemCategory} />
          </TouchableOpacity>
        );
      }}
      estimatedItemSize={80}
    />
  );
}
