import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGastos } from '../context/ExpensesContext';
import ExpenseCard from '../components/ExpenseCard';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { expenses, loading } = useGastos();
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="px-5 mb-3">
            <ExpenseCard expense={item} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center bg-white p-5">
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text className="mt-4 text-gray-500 text-center text-lg">
              No hay gastos registrados
            </Text>
            <Text className="mt-2 text-gray-400 text-center">
              Agrega gastos para ver tu historial
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            {/* Header Azul */}
            <View className="bg-blue-600 px-5 pt-8 pb-12">
              <Text className="text-white text-3xl font-bold mb-2">
                Gastos Compartidos
              </Text>
              <Text className="text-blue-200 text-base">
                Total gastado y resumen de gastos
              </Text>
            </View>

            <View className="px-5 -mt-8">
              {/* Tarjeta Total Gastado */}
              <View className="bg-white rounded-2xl p-5 shadow-lg mb-5">
                <View className="flex-row items-center mb-4">
                  <View className="bg-green-100 p-2 rounded-full">
                    <Ionicons name="cash" size={24} color="#10B981" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800 ml-3">
                    Total Gastado
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-4xl font-bold text-gray-900">
                      ${totalAmount.toFixed(2)}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      En {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-4 py-2 rounded-full">
                    <Text className="text-blue-700 font-bold">
                      {expenses.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Encabezado Gastos Recientes */}
              {expenses.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-800">
                    Gastos Recientes
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Historial de transacciones
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      />

      {/* Botón Flotante + */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/add-expense')}
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}