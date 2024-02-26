import { FlashList } from '@shopify/flash-list';
import { TouchableOpacity } from 'react-native';

import TransactionListItem from './TransactionListItem';
import { Category, Transaction } from '../lib/types';

export default function TransactionsList({
  transactions,
  categories,
  deleteTransaction,
}: {
  transactions: Transaction[];
  categories: Category[];
  deleteTransaction: (id: number) => Promise<void>;
}) {
  return (
    <FlashList
      className="bg-slate-50"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 20,
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
