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
import { useGastos } from '../context/ExpensesContext';
import { USERS, getUserName } from '../constants/users';
import { Expense } from '../types/expense.types';
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { addExpense } = useGastos();

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
        <View className="flex-1 bg-black/50">
            <View className="flex-1 justify-center items-center p-5">
                <View className="bg-white rounded-2xl w-full max-w-md">
                    <ScrollView className="max-h-[85vh]" showsVerticalScrollIndicator={false}>
                        <View className="p-6">
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-bold text-gray-800">
                                    Nuevo Gasto
                                </Text>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Ionicons name="close" size={28} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {/* Descripción */}
                            <Text className="text-gray-700 font-medium mb-2">
                                Descripción
                            </Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-base mb-4"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Ej: Cena con amigos"
                                placeholderTextColor="#999"
                            />

                            {/* Monto */}
                            <Text className="text-gray-700 font-medium mb-2">
                                Monto
                            </Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-3 mb-4">
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

                            {/* ¿Quién pagó? */}
                            <Text className="text-gray-700 font-medium mb-2">
                                ¿Quién pagó?
                            </Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-lg mb-4">
                                {USERS.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        className={`p-3 border-b border-gray-100 ${paidBy === user.id ? 'bg-blue-50' : ''
                                            }`}
                                        onPress={() => setPaidBy(user.id)}
                                    >
                                        <Text className={`text-base ${paidBy === user.id ? 'text-blue-600 font-semibold' : 'text-gray-700'
                                            }`}>
                                            {user.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Participantes */}
                            <Text className="text-gray-700 font-medium mb-3">
                                Participantes
                            </Text>
                            <View className="flex-row flex-wrap mb-4">
                                {USERS.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        className={`px-4 py-2 rounded-full mr-2 mb-2 ${participants.includes(user.id)
                                            ? 'bg-blue-500'
                                            : 'bg-blue-100'
                                            }`}
                                        onPress={() => toggleParticipant(user.id)}
                                    >
                                        <Text
                                            className={`font-medium ${participants.includes(user.id)
                                                ? 'text-white'
                                                : 'text-blue-600'
                                                }`}
                                        >
                                            {user.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Foto del Recibo */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-2">
                                    <Text className="text-gray-700 font-medium">
                                        Foto del Recibo
                                    </Text>
                                    <View className="bg-red-100 px-2 py-1 rounded ml-2">
                                        <Text className="text-red-600 text-xs font-bold">
                                            Obligatorio
                                        </Text>
                                    </View>
                                </View>

                                {!receiptUri ? (
                                    <TouchableOpacity
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center"
                                        onPress={takePhoto}
                                    >
                                        <Ionicons name="camera-outline" size={48} color="#999" />
                                        <Text className="text-gray-600 text-center mt-3 font-medium">
                                            Tomar Foto del Recibo
                                        </Text>
                                        <Text className="text-gray-400 text-sm text-center mt-1">
                                            Es necesario para registrar el gasto
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View>
                                        <Image
                                            source={{ uri: receiptUri }}
                                            className="w-full h-48 rounded-lg"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-full"
                                            onPress={takePhoto}
                                        >
                                            <Ionicons name="camera" size={20} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Error Message */}
                            {error && (
                                <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                                    <Text className="text-red-700 text-center">{error}</Text>
                                </View>
                            )}

                            {/* Botón Guardar */}
                            <TouchableOpacity
                                className={`p-4 rounded-lg items-center flex-row justify-center ${saving ? 'bg-gray-400' : 'bg-blue-600'
                                    }`}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <Ionicons name="camera" size={20} color="white" />
                                <Text className="text-white text-lg font-bold ml-2">
                                    {saving ? 'Guardando...' : 'Guardar Gasto con Recibo'}
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center justify-center mt-3">
                                <Ionicons name="information-circle" size={16} color="#666" />
                                <Text className="text-gray-500 text-xs ml-1">
                                    Todos los gastos deben incluir foto del recibo
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}