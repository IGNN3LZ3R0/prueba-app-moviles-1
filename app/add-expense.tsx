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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);

    const requestPermissions = async (): Promise<boolean> => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permisos Requeridos',
                'Se necesita acceso a la cámara para tomar fotos de los recibos. Por favor, habilita los permisos en la configuración de tu dispositivo.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Ir a Configuración', onPress: () => {
                        // Aquí podrías abrir la configuración del dispositivo
                    }}
                ]
            );
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
                clearFieldError('receipt');
            }
        } catch (error) {
            Alert.alert(
                'Error al Tomar Foto',
                'No se pudo acceder a la cámara. Por favor, intenta nuevamente.',
                [{ text: 'Entendido' }]
            );
        }
    };

    const toggleParticipant = (userId: string) => {
        setParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
        clearFieldError('participants');
    };

    const clearFieldError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const validateDescription = (value: string): string | null => {
        const trimmed = value.trim();
        
        if (!trimmed) {
            return 'La descripción es requerida';
        }
        
        if (trimmed.length < 3) {
            return 'La descripción debe tener al menos 3 caracteres';
        }
        
        if (trimmed.length > 100) {
            return 'La descripción no puede exceder 100 caracteres';
        }
        
        return null;
    };

    const validateAmount = (value: string): string | null => {
        if (!value || value.trim() === '') {
            return 'El monto es requerido';
        }

        const amountNum = parseFloat(value);
        
        if (isNaN(amountNum)) {
            return 'El monto debe ser un número válido';
        }
        
        if (amountNum <= 0) {
            return 'El monto debe ser mayor a 0';
        }
        
        if (amountNum > 999999.99) {
            return 'El monto no puede exceder $999,999.99';
        }

        // Validar que no tenga más de 2 decimales
        const decimalPart = value.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            return 'El monto solo puede tener hasta 2 decimales';
        }
        
        return null;
    };

    const validatePaidBy = (value: string): string | null => {
        if (!value) {
            return 'Debes seleccionar quién pagó';
        }
        
        const userExists = USERS.some(user => user.id === value);
        if (!userExists) {
            return 'Usuario seleccionado no válido';
        }
        
        return null;
    };

    const validateParticipants = (value: string[]): string | null => {
        if (value.length === 0) {
            return 'Debes seleccionar al menos un participante';
        }
        
        // Validar que todos los participantes existan
        const allValid = value.every(id => USERS.some(user => user.id === id));
        if (!allValid) {
            return 'Uno o más participantes seleccionados no son válidos';
        }
        
        return null;
    };

    const validateReceipt = (uri: string): string | null => {
        if (!uri) {
            return 'La foto del recibo es obligatoria';
        }
        
        // Validar que la URI sea válida
        if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
            return 'La foto del recibo no es válida';
        }
        
        return null;
    };

    const validateAll = (): boolean => {
        const newErrors: Record<string, string> = {};

        const descError = validateDescription(description);
        if (descError) newErrors.description = descError;

        const amountError = validateAmount(amount);
        if (amountError) newErrors.amount = amountError;

        const paidByError = validatePaidBy(paidBy);
        if (paidByError) newErrors.paidBy = paidByError;

        const participantsError = validateParticipants(participants);
        if (participantsError) newErrors.participants = participantsError;

        const receiptError = validateReceipt(receiptUri);
        if (receiptError) newErrors.receipt = receiptError;

        setErrors(newErrors);
        setTouched({
            description: true,
            amount: true,
            paidBy: true,
            participants: true,
            receipt: true,
        });

        return Object.keys(newErrors).length === 0;
    };

    const handleDescriptionBlur = () => {
        setTouched(prev => ({ ...prev, description: true }));
        const error = validateDescription(description);
        if (error) {
            setErrors(prev => ({ ...prev, description: error }));
        } else {
            clearFieldError('description');
        }
    };

    const handleAmountBlur = () => {
        setTouched(prev => ({ ...prev, amount: true }));
        const error = validateAmount(amount);
        if (error) {
            setErrors(prev => ({ ...prev, amount: error }));
        } else {
            clearFieldError('amount');
        }
    };

    const handleAmountChange = (value: string) => {
        // Permitir solo números y un punto decimal
        const sanitized = value.replace(/[^0-9.]/g, '');
        
        // Evitar múltiples puntos decimales
        const parts = sanitized.split('.');
        const formatted = parts.length > 2 
            ? parts[0] + '.' + parts.slice(1).join('')
            : sanitized;
        
        setAmount(formatted);
        
        if (touched.amount) {
            const error = validateAmount(formatted);
            if (error) {
                setErrors(prev => ({ ...prev, amount: error }));
            } else {
                clearFieldError('amount');
            }
        }
    };

    const handleSave = async () => {
        if (!validateAll()) {
            Alert.alert(
                'Campos Incompletos',
                'Por favor, corrige los errores antes de guardar.',
                [{ text: 'Entendido' }]
            );
            return;
        }

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

            Alert.alert(
                '✅ Éxito',
                'El gasto ha sido registrado correctamente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert(
                '❌ Error',
                'No se pudo guardar el gasto. Por favor, intenta nuevamente.',
                [{ text: 'Entendido' }]
            );
        } finally {
            setSaving(false);
        }
    };

    const renderError = (field: string) => {
        if (touched[field] && errors[field]) {
            return (
                <View className="flex-row items-center mt-1 mb-2">
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text className="text-red-600 text-sm ml-1">{errors[field]}</Text>
                </View>
            );
        }
        return null;
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
                                Descripción *
                            </Text>
                            <TextInput
                                className={`bg-gray-50 border p-3 rounded-lg text-base ${
                                    touched.description && errors.description
                                        ? 'border-red-500'
                                        : 'border-gray-200'
                                }`}
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (touched.description) {
                                        const error = validateDescription(text);
                                        if (error) {
                                            setErrors(prev => ({ ...prev, description: error }));
                                        } else {
                                            clearFieldError('description');
                                        }
                                    }
                                }}
                                onBlur={handleDescriptionBlur}
                                placeholder="Ej: Cena con amigos"
                                placeholderTextColor="#999"
                                maxLength={100}
                            />
                            {renderError('description')}
                            <Text className="text-gray-400 text-xs mb-4">
                                {description.length}/100 caracteres
                            </Text>

                            {/* Monto */}
                            <Text className="text-gray-700 font-medium mb-2">
                                Monto *
                            </Text>
                            <View className={`flex-row items-center bg-gray-50 border rounded-lg px-3 ${
                                touched.amount && errors.amount
                                    ? 'border-red-500'
                                    : 'border-gray-200'
                            }`}>
                                <Text className="text-xl text-gray-600 mr-2">$</Text>
                                <TextInput
                                    className="flex-1 py-3 text-base"
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    onBlur={handleAmountBlur}
                                    placeholder="0.00"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            {renderError('amount')}

                            {/* ¿Quién pagó? */}
                            <Text className="text-gray-700 font-medium mb-2">
                                ¿Quién pagó? *
                            </Text>
                            <View className={`bg-gray-50 border rounded-lg ${
                                touched.paidBy && errors.paidBy
                                    ? 'border-red-500'
                                    : 'border-gray-200'
                            }`}>
                                {USERS.map((user, index) => (
                                    <TouchableOpacity
                                        key={user.id}
                                        className={`p-3 ${
                                            index < USERS.length - 1 ? 'border-b border-gray-100' : ''
                                        } ${paidBy === user.id ? 'bg-blue-50' : ''}`}
                                        onPress={() => {
                                            setPaidBy(user.id);
                                            setTouched(prev => ({ ...prev, paidBy: true }));
                                            clearFieldError('paidBy');
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <Text className={`text-base ${
                                                paidBy === user.id
                                                    ? 'text-blue-600 font-semibold'
                                                    : 'text-gray-700'
                                            }`}>
                                                {user.name}
                                            </Text>
                                            {paidBy === user.id && (
                                                <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {renderError('paidBy')}

                            {/* Participantes */}
                            <Text className="text-gray-700 font-medium mb-3 mt-4">
                                Participantes *
                            </Text>
                            <View className="flex-row flex-wrap mb-2">
                                {USERS.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                                            participants.includes(user.id)
                                                ? 'bg-blue-500'
                                                : 'bg-blue-100'
                                        }`}
                                        onPress={() => {
                                            toggleParticipant(user.id);
                                            setTouched(prev => ({ ...prev, participants: true }));
                                        }}
                                    >
                                        <View className="flex-row items-center">
                                            <Text className={`font-medium ${
                                                participants.includes(user.id)
                                                    ? 'text-white'
                                                    : 'text-blue-600'
                                            }`}>
                                                {user.name}
                                            </Text>
                                            {participants.includes(user.id) && (
                                                <Ionicons name="checkmark" size={16} color="white" className="ml-1" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {renderError('participants')}
                            {participants.length > 0 && (
                                <Text className="text-gray-500 text-sm mb-4">
                                    {participants.length} participante{participants.length !== 1 ? 's' : ''} seleccionado{participants.length !== 1 ? 's' : ''}
                                </Text>
                            )}

                            {/* Foto del Recibo */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-2">
                                    <Text className="text-gray-700 font-medium">
                                        Foto del Recibo *
                                    </Text>
                                    <View className="bg-red-100 px-2 py-1 rounded ml-2">
                                        <Text className="text-red-600 text-xs font-bold">
                                            Obligatorio
                                        </Text>
                                    </View>
                                </View>

                                {!receiptUri ? (
                                    <TouchableOpacity
                                        className={`border-2 border-dashed rounded-lg p-8 items-center justify-center ${
                                            touched.receipt && errors.receipt
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-300'
                                        }`}
                                        onPress={() => {
                                            takePhoto();
                                            setTouched(prev => ({ ...prev, receipt: true }));
                                        }}
                                    >
                                        <Ionicons 
                                            name="camera-outline" 
                                            size={48} 
                                            color={touched.receipt && errors.receipt ? "#DC2626" : "#999"} 
                                        />
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
                                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-lg"
                                            onPress={takePhoto}
                                        >
                                            <Ionicons name="camera" size={20} color="#666" />
                                        </TouchableOpacity>
                                        <View className="absolute bottom-2 left-2 bg-green-500/90 px-2 py-1 rounded flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={14} color="white" />
                                            <Text className="text-white text-xs font-bold ml-1">
                                                Recibo cargado
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {renderError('receipt')}
                            </View>

                            {/* Resumen */}
                            {!Object.keys(errors).length && Object.keys(touched).length > 0 && (
                                <View className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                                    <View className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                                        <Text className="text-green-700 font-medium ml-2">
                                            Todos los campos están completos
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Botón Guardar */}
                            <TouchableOpacity
                                className={`p-4 rounded-lg items-center flex-row justify-center ${
                                    saving ? 'bg-gray-400' : 'bg-blue-600'
                                }`}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Ionicons name="save" size={20} color="white" />
                                )}
                                <Text className="text-white text-lg font-bold ml-2">
                                    {saving ? 'Guardando...' : 'Guardar Gasto'}
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center justify-center mt-3">
                                <Ionicons name="information-circle" size={16} color="#666" />
                                <Text className="text-gray-500 text-xs ml-1">
                                    Todos los campos marcados con * son obligatorios
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}