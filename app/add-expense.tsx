import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useExpenses } from '../context/ExpensesContext';
import { USERS, getUserName } from '../constants/users';
import { Expense } from '../types/expense.types';
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [receiptUri, setReceiptUri] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos de cámara');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptUri(result.assets[0].uri);
        setError('');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const toggleParticipant = (userId: string) => {
    setParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const validate = (): boolean => {
    if (!description.trim()) {
      setError('⚠️ La descripción es requerida');
      return false;
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('⚠️ El monto debe ser mayor a 0');
      return false;
    }
    
    if (!paidBy) {
      setError('⚠️ Debes seleccionar quién pagó');
      return false;
    }
    
    if (participants.length === 0) {
      setError('⚠️ Debes seleccionar al menos un participante');
      return false;
    }
    
    if (!receiptUri) {
      setError('📸 La foto del recibo es OBLIGATORIA');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      
      const expense: Expense = {
        id: Date.now().toString(),
        description: description.trim(),
        amount: parseFloat(amount),
        paidBy,
        paidByName: getUserName(paidBy),
        participants,
        receiptUri,
        date: new Date().toISOString(),
      };

      await addExpense(expense);
      
      Alert.alert('Éxito', 'Gasto registrado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        {/* Botón volver */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          <Text className="ml-2 text-green-600 font-semibold">Volver</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Agregar Nuevo Gasto
        </Text>

        <Text className="text-base font-bold text-gray-700 mt-4 mb-2">
          Descripción *
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-base"
          value={description}
          onChangeText={setDescription}
          placeholder="Ej: Cena en restaurante"
          placeholderTextColor="#999"
        />

        <Text className="text-base font-bold text-gray-700 mt-4 mb-2">
          Monto *
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3">
          <Text className="text-xl text-gray-600 mr-2">$</Text>
          <TextInput
            className="flex-1 py-3 text-base"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        <Text className="text-base font-bold text-gray-700 mt-4 mb-2">
          ¿Quién pagó? *
        </Text>
        {USERS.map(user => (
          <TouchableOpacity
            key={user.id}
            className={`p-3 mb-2 rounded-lg border ${
              paidBy === user.id
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
            }`}
            onPress={() => setPaidBy(user.id)}
          >
            <Text
              className={`text-base ${
                paidBy === user.id ? 'text-white font-bold' : 'text-gray-700'
              }`}
            >
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}

        <Text className="text-base font-bold text-gray-700 mt-4 mb-2">
          Participantes * (pueden ser varios)
        </Text>
        {USERS.map(user => (
          <TouchableOpacity
            key={user.id}
            className={`p-3 mb-2 rounded-lg border ${
              participants.includes(user.id)
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
            }`}
            onPress={() => toggleParticipant(user.id)}
          >
            <Text
              className={`text-base ${
                participants.includes(user.id)
                  ? 'text-white font-bold'
                  : 'text-gray-700'
              }`}
            >
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}

        <Text className="text-base font-bold text-gray-700 mt-4 mb-2">
          Foto del Recibo * (OBLIGATORIO)
        </Text>
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg items-center flex-row justify-center"
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text className="text-white text-base font-bold ml-2">
            {receiptUri ? 'Cambiar Foto' : 'Tomar Foto'}
          </Text>
        </TouchableOpacity>

        {receiptUri && (
          <View className="mt-4">
            <Image
              source={{ uri: receiptUri }}
              className="w-full h-52 rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-green-600 text-center mt-2 font-semibold">
              ✓ Foto capturada
            </Text>
          </View>
        )}

        {error && (
          <View className="bg-red-100 border border-red-400 p-3 rounded-lg mt-4">
            <Text className="text-red-700 font-semibold">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          className={`p-5 rounded-lg items-center mt-6 mb-10 ${
            saving ? 'bg-gray-400' : 'bg-green-500'
          }`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">Guardar Gasto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}