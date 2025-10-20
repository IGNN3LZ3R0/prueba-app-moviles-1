import { View, Text, ScrollView } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import { calculateBalances, calculateTotalByPerson, calculateAverage } from '../utils/balanceCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function BalanceScreen() {
  const { expenses } = useExpenses();
  
  const balances = calculateBalances(expenses);
  const totalsByPerson = calculateTotalByPerson(expenses);
  const average = calculateAverage(expenses);
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (expenses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-5">
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        {/* Resumen Total */}
        <View className="bg-green-500 p-5 rounded-lg mb-5 shadow">
          <Text className="text-white text-center text-lg font-bold mb-2">
            Total Gastado
          </Text>
          <Text className="text-white text-center text-4xl font-bold">
            ${totalAmount.toFixed(2)}
          </Text>
          <Text className="text-white text-center text-sm mt-2 opacity-90">
            Promedio por persona: ${average.toFixed(2)}
          </Text>
        </View>

        {/* Gastos por Persona */}
        <View className="bg-white p-5 rounded-lg mb-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            💰 Total Pagado por Cada Uno
          </Text>
          {Object.entries(totalsByPerson).map(([name, total]) => (
            <View key={name} className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-700">{name}</Text>
              <Text className="text-lg font-bold text-green-600">
                ${total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Balances */}
        <View className="bg-white p-5 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            🔄 Balances - Quién Debe a Quién
          </Text>
          
          {balances.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text className="mt-3 text-green-600 text-center font-semibold text-lg">
                ¡Todo está balanceado!
              </Text>
              <Text className="mt-1 text-gray-500 text-center">
                Todos han pagado su parte justa
              </Text>
            </View>
          ) : (
            balances.map((balance, index) => (
              <View
                key={index}
                className="bg-orange-50 p-4 rounded-lg mb-3 border-l-4 border-orange-400"
              >
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
            ))
          )}
        </View>

        {/* Nota */}
        <View className="bg-blue-50 p-4 rounded-lg mt-5 border-l-4 border-blue-400">
          <Text className="text-blue-800 text-sm">
            <Text className="font-bold">Nota:</Text> Los balances muestran la forma más eficiente de saldar las deudas entre todos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}