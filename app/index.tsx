import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../context/ExpensesContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { expenses, loading } = useExpenses();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-4 text-gray-600">Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-800 flex-1">
                {item.description}
              </Text>
              <Text className="text-xl font-bold text-green-600">
                ${item.amount.toFixed(2)}
              </Text>
            </View>
            
            <View className="flex-row items-center mb-1">
              <Ionicons name="person" size={16} color="#666" />
              <Text className="ml-2 text-gray-600">
                Pagado por: {item.paidByName}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={16} color="#666" />
              <Text className="ml-2 text-gray-500 text-sm">
                {new Date(item.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text className="mt-4 text-gray-500 text-center text-lg">
              No hay gastos registrados
            </Text>
            <Text className="mt-2 text-gray-400 text-center">
              Presiona el botón + para agregar uno
            </Text>
          </View>
        }
      />
      
      {/* Botón flotante */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 bg-green-500 w-16 h-16 rounded-full justify-center items-center shadow-lg"
        onPress={() => router.push('/add-expense')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}