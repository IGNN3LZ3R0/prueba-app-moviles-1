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
import { useExpenses } from '../context/ExpensesContext';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/expense.types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;

export default function GalleryScreen() {
  const { expenses } = useExpenses();
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
      <View className="flex-1 justify-center items-center bg-gray-50 p-5">
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
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openModal(item)}
            className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
            style={{ width: ITEM_SIZE }}
          >
            <Image
              source={{ uri: item.receiptUri }}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
              resizeMode="cover"
            />
            <View className="p-2">
              <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                {item.description}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/90">
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

              <View className="bg-white rounded-lg p-5 mt-5 w-full">
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  {selectedExpense.description}
                </Text>
                
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600">Monto:</Text>
                  <Text className="text-xl font-bold text-green-600">
                    ${selectedExpense.amount.toFixed(2)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600">Pagado por:</Text>
                  <Text className="font-semibold text-gray-800">
                    {selectedExpense.paidByName}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
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