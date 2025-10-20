import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useGastos } from '../context/ExpensesContext';
import { calculateBalances, calculateTotalByPerson, calculateAverage } from '../utils/balanceCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function BalanceScreen() {
  const { expenses } = useGastos();

  const balances = calculateBalances(expenses);
  const totalsByPerson = calculateTotalByPerson(expenses);
  const average = calculateAverage(expenses);
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (expenses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Ionicons name="calculator-outline" size={80} color="#ccc" />
        <Text className="mt-4 text-gray-500 text-center text-lg">
          No hay gastos para calcular
        </Text>
        <Text className="mt-2 text-gray-400 text-center">
          Agrega gastos para ver los balances
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header Morado */}
      <View className="bg-purple-600 px-5 pt-8 pb-12">
        <Text className="text-white text-3xl font-bold mb-2">
          Balance de Cuentas
        </Text>
        <Text className="text-purple-200 text-base">
          ¿Quién debe a quién?
        </Text>
      </View>

      <View className="px-5 -mt-8">
        {/* Resumen de Deudas */}
        <View className="bg-white rounded-2xl p-5 shadow-lg mb-5">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-100 p-2 rounded-full">
              <Ionicons name="cash" size={24} color="#10B981" />
            </View>
            <Text className="text-lg font-bold text-gray-800 ml-3">
              Resumen de Deudas
            </Text>
          </View>

          {balances.length === 0 ? (
            <View className="items-center py-6">
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
              <Text className="mt-3 text-green-600 text-center font-semibold text-lg">
                ¡Todo está balanceado!
              </Text>
            </View>
          ) : (
            balances.map((balance, index) => (
              <View key={index} className="mb-3">
                <View className="bg-gray-50 rounded-xl p-4 flex-row items-center">
                  <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center">
                    <Text className="text-red-600 font-bold text-lg">
                      {balance.from[0]}
                    </Text>
                  </View>
                  <View className="flex-1 mx-3">
                    <Text className="text-gray-800 font-semibold">
                      {balance.from}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      debe a {balance.to}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-red-600 text-2xl font-bold">
                      ${balance.amount.toFixed(0)}
                    </Text>
                    <TouchableOpacity className="mt-1">
                      <Text className="text-blue-500 text-xs">
                        Marcar pagado
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Algoritmo de División */}
        <View className="bg-green-50 rounded-2xl p-5 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Algoritmo de División
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Método: Simplificación de deudas
          </Text>

          <View className="space-y-2">
            {Object.entries(totalsByPerson).map(([name, total]) => (
              <View key={name} className="flex-row justify-between py-2">
                <Text className="text-gray-700">
                  {name} gastó:
                </Text>
                <Text className="text-gray-900 font-semibold">
                  ${total.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>

          <View className="border-t border-green-200 mt-3 pt-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-700 font-medium">
                Promedio por persona:
              </Text>
              <Text className="text-gray-900 font-bold">
                ${average.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}