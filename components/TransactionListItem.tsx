import { Text, View } from 'react-native';

import { Card, CardContent } from './ui/card';
import { categoryEmojies } from '../lib/constants';
import { Category, Transaction } from '../lib/types';

interface TransactionListItemProps {
  transaction: Transaction;
  categoryInfo: Category | undefined;
}

export default function TransactionListItem({
  transaction,
  categoryInfo,
}: TransactionListItemProps) {
  const transactionSymbol = transaction.type === 'Expense' ? '-' : '+';
  const color = transaction.type === 'Expense' ? 'text-red-500' : 'text-green-500';
  const emoji = categoryEmojies[categoryInfo?.name ?? 'Default'];
  return (
    <Card>
      <CardContent className="flex-row gap-4">
        <View className="bg-slate-200 p-2 rounded-full">
          <Text className="text-xl">{emoji}</Text>
        </View>
        <View className="flex-1  justify-between">
          <Text className="font-semibold">{transaction.description}</Text>
          <Text className="text-sm text-slate-500">{categoryInfo?.name}</Text>
        </View>
        <View className="items-end justify-between">
          <Text className={`${color} font-semibold`}>
            {transactionSymbol} ${transaction.amount}
          </Text>
          <Text className="text-sm text-slate-400">
            {new Date(transaction.date * 1000).toLocaleDateString('en-US')}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
