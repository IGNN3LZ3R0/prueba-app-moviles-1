import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/expense.types';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

export default function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-gray-800 flex-1">
          {expense.description}
        </Text>
        <Text className="text-xl font-bold text-green-600">
          ${expense.amount.toFixed(2)}
        </Text>
      </View>
      
      <View className="flex-row items-center mb-1">
        <Ionicons name="person" size={16} color="#666" />
        <Text className="ml-2 text-gray-600">
          Pagado por: {expense.paidByName}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        <Ionicons name="calendar" size={16} color="#666" />
        <Text className="ml-2 text-gray-500 text-sm">
          {new Date(expense.date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>

      {expense.receiptUri && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="camera" size={16} color="#4CAF50" />
          <Text className="ml-2 text-green-600 text-xs">
            Con recibo adjunto
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}