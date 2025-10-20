import { View, Text } from 'react-native';
import { Balance } from '../types/expense.types';

interface BalanceItemProps {
  balance: Balance;
}

export default function BalanceItem({ balance }: BalanceItemProps) {
  return (
    <View className="bg-orange-50 p-4 rounded-lg mb-3 border-l-4 border-orange-400">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base text-gray-700">
            <Text className="font-bold">{balance.from}</Text>
            {' debe a '}
            <Text className="font-bold">{balance.to}</Text>
          </Text>
        </View>
        <Text className="text-xl font-bold text-orange-600 ml-3">
          ${balance.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}