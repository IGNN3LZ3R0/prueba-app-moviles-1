import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useGastos } from '../context/ExpensesContext';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/expense.types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;

export default function GalleryScreen() {
  const { expenses } = useGastos();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedExpense(null);
  };

  if (expenses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Ionicons name="images-outline" size={80} color="#ccc" />
        <Text className="mt-4 text-gray-500 text-center text-lg">
          No hay recibos para mostrar
        </Text>
        <Text className="mt-2 text-gray-400 text-center">
          Los recibos aparecerán aquí cuando agregues gastos
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header Naranja */}
      <View className="bg-orange-500 px-5 pt-8 pb-12">
        <Text className="text-white text-3xl font-bold mb-2">
          Galería de Recibos
        </Text>
        <Text className="text-orange-100 text-base">
          {expenses.length} recibos registrados
        </Text>
      </View>

      {/* Info Card */}
      <View className="px-5 -mt-8 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-lg flex-row items-center">
          <View className="bg-blue-100 p-3 rounded-full">
            <Ionicons name="camera" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-gray-800 font-bold text-base">
              Recibos Verificados
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Todos los gastos incluyen foto del recibo para mayor control
            </Text>
          </View>
        </View>
      </View>

      {/* Grid de Recibos */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openModal(item)}
            className="mb-4 bg-gray-100 rounded-xl overflow-hidden"
            style={{ width: ITEM_SIZE }}
          >
            {/* Imagen */}
            <View className="relative">
              <Image
                source={{ uri: item.receiptUri }}
                style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2 bg-white/20 backdrop-blur p-1.5 rounded-full">
                <Ionicons name="search" size={16} color="white" />
              </View>
            </View>

            {/* Info */}
            <View className="p-3 bg-white">
              <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
                {item.description}
              </Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
                <Text className="text-base font-bold text-blue-600">
                  ${item.amount.toFixed(0)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View className="items-center py-6">
            <View className="bg-gray-100 px-6 py-3 rounded-full">
              <Text className="text-gray-600 font-semibold">
                {expenses.length}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mt-2">
              Total Recibos
            </Text>
          </View>
        )}
      />

      {/* Modal de Vista Completa */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/95">
          <TouchableOpacity
            className="absolute top-12 right-5 z-10 bg-white/20 p-3 rounded-full"
            onPress={closeModal}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {selectedExpense && (
            <View className="flex-1 justify-center items-center p-5">
              <Image
                source={{ uri: selectedExpense.receiptUri }}
                style={{ width: '100%', height: '70%' }}
                resizeMode="contain"
              />

              <View className="bg-white rounded-2xl p-5 mt-5 w-full">
                <Text className="text-xl font-bold text-gray-800 mb-3">
                  {selectedExpense.description}
                </Text>

                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <Text className="text-gray-600">Monto:</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    ${selectedExpense.amount.toFixed(2)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <Text className="text-gray-600">Pagado por:</Text>
                  <Text className="font-bold text-gray-800">
                    {selectedExpense.paidByName}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-gray-600">Fecha:</Text>
                  <Text className="text-gray-800">
                    {new Date(selectedExpense.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}