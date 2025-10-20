import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useGastos } from '../context/ExpensesContext';
import { calculateBalances, calculateTotalByPerson } from '../utils/balanceCalculator';
import { generatePDFReport, sharePDF } from '../utils/pdfGenerator';
import { Ionicons } from '@expo/vector-icons';

// Función auxiliar para categorizar gastos
const categorizeExpenses = (expenses: any[]) => {
  const categories: { [key: string]: number } = {};

  expenses.forEach(expense => {
    const desc = expense.description.toLowerCase();
    let category = 'Otros';

    if (desc.includes('comida') || desc.includes('cena') || desc.includes('almuerzo') || desc.includes('restaurante')) {
      category = 'Comida';
    } else if (desc.includes('super') || desc.includes('mercado')) {
      category = 'Supermercado';
    } else if (desc.includes('uber') || desc.includes('taxi') || desc.includes('transporte')) {
      category = 'Transporte';
    } else if (desc.includes('café') || desc.includes('cafetería')) {
      category = 'Café';
    } else if (desc.includes('restaurante')) {
      category = 'Restaurantes';
    }

    categories[category] = (categories[category] || 0) + expense.amount;
  });

  return categories;
};

export default function ReportScreen() {
  const { expenses } = useGastos();
  const [generating, setGenerating] = useState(false);

  const balances = calculateBalances(expenses);
  const totalsByPerson = calculateTotalByPerson(expenses);
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = categorizeExpenses(expenses);
  const dailyAverage = expenses.length > 0 ? totalAmount / 15 : 0;

  const handleGeneratePDF = async () => {
    if (expenses.length === 0) {
      Alert.alert('Sin datos', 'No hay gastos para generar el reporte');
      return;
    }

    try {
      setGenerating(true);
      const uri = await generatePDFReport(expenses, balances, totalsByPerson);
      await sharePDF(uri);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header Morado */}
      <View className="bg-purple-600 px-5 pt-8 pb-12">
        <Text className="text-white text-3xl font-bold mb-2">
          Reporte Mensual
        </Text>
        <Text className="text-purple-200 text-base">
          Octubre 2025
        </Text>
      </View>

      <View className="px-5 -mt-8">
        {/* Cards de Resumen */}
        <View className="flex-row justify-between mb-5">
          {/* Total Gastos */}
          <View className="bg-white rounded-2xl p-5 shadow-lg flex-1 mr-2">
            <Text className="text-gray-600 text-sm mb-2">
              Total Gastos
            </Text>
            <Text className="text-gray-900 text-3xl font-bold">
              ${totalAmount.toFixed(0)}
            </Text>
          </View>

          {/* Promedio/día */}
          <View className="bg-white rounded-2xl p-5 shadow-lg flex-1 ml-2">
            <Text className="text-gray-600 text-sm mb-2">
              Promedio/día
            </Text>
            <Text className="text-gray-900 text-3xl font-bold">
              ${dailyAverage.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Gastos por Categoría */}
        <View className="bg-white rounded-2xl p-5 shadow-lg mb-5">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Gastos por Categoría
          </Text>

          {Object.entries(categories).map(([category, amount]) => {
            const percentage = (amount / totalAmount) * 100;
            let color = 'bg-blue-500';

            if (category === 'Comida') color = 'bg-blue-500';
            else if (category === 'Restaurantes') color = 'bg-purple-500';
            else if (category === 'Transporte') color = 'bg-orange-500';
            else color = 'bg-gray-400';

            return (
              <View key={category} className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-700 font-medium">
                    {category}
                  </Text>
                  <Text className="text-gray-900 font-bold">
                    ${amount.toFixed(0)}
                  </Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Período del Reporte */}
        <View className="bg-white rounded-2xl p-5 shadow-lg mb-5">
          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar" size={24} color="#666" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              Período del Reporte
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm mb-2">Desde</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text className="text-gray-700 ml-2">01/10/2025</Text>
              </View>
            </View>

            <View className="flex-1 ml-2">
              <Text className="text-gray-600 text-sm mb-2">Hasta</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text className="text-gray-700 ml-2">17/10/2025</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        <TouchableOpacity
          className={`rounded-2xl p-5 mb-3 items-center shadow-lg ${
            generating || expenses.length === 0 ? 'bg-gray-400' : 'bg-purple-600'
          }`}
          onPress={handleGeneratePDF}
          disabled={generating || expenses.length === 0}
        >
          {generating ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white text-lg font-bold ml-3">
                Generando...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="download" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Generar PDF
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border-2 border-purple-600 rounded-2xl p-5 mb-6 items-center"
          disabled={expenses.length === 0}
        >
          <Text className="text-purple-600 text-lg font-bold">
            Compartir Reporte
          </Text>
        </TouchableOpacity>

        {/* Mensaje de advertencia si no hay gastos */}
        {expenses.length === 0 && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex-row items-start">
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="text-yellow-800 font-semibold mb-1">
                No hay datos
              </Text>
              <Text className="text-yellow-700 text-sm">
                Necesitas agregar al menos un gasto para generar el reporte.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}