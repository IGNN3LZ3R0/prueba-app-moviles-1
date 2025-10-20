import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import { calculateBalances, calculateTotalByPerson } from '../utils/balanceCalculator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

export default function ReportScreen() {
  const { expenses } = useExpenses();
  const [generating, setGenerating] = useState(false);

  const balances = calculateBalances(expenses);
  const totalsByPerson = calculateTotalByPerson(expenses);
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const generatePDF = async () => {
    if (expenses.length === 0) {
      Alert.alert('Sin datos', 'No hay gastos para generar el reporte');
      return;
    }

    try {
      setGenerating(true);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
              h1 { color: #4CAF50; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px; }
              h2 { color: #666; margin-top: 30px; margin-bottom: 15px; }
              .header-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 25px; }
              .total-box { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
              .total-amount { font-size: 36px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; font-weight: bold; }
              td { border: 1px solid #ddd; padding: 10px; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .amount { font-weight: bold; color: #4CAF50; }
              .balance-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 10px 0; border-radius: 4px; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>📊 Reporte de Gastos Compartidos</h1>
            
            <div class="header-info">
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
              <p><strong>Total de gastos:</strong> ${expenses.length}</p>
            </div>

            <div class="total-box">
              <div>TOTAL GASTADO</div>
              <div class="total-amount">$${totalAmount.toFixed(2)}</div>
            </div>

            <h2>💰 Total Pagado por Persona</h2>
            <table>
              <tr><th>Nombre</th><th style="text-align: right;">Total Pagado</th></tr>
              ${Object.entries(totalsByPerson).map(([name, total]) => `
                <tr><td>${name}</td><td style="text-align: right;" class="amount">$${total.toFixed(2)}</td></tr>
              `).join('')}
            </table>

            <h2>📝 Lista Detallada de Gastos</h2>
            <table>
              <tr><th>Descripción</th><th>Monto</th><th>Pagado por</th><th>Fecha</th></tr>
              ${expenses.map(exp => `
                <tr>
                  <td>${exp.description}</td>
                  <td class="amount">$${exp.amount.toFixed(2)}</td>
                  <td>${exp.paidByName}</td>
                  <td>${new Date(exp.date).toLocaleDateString('es-ES')}</td>
                </tr>
              `).join('')}
            </table>

            <h2>🔄 Balances - Quién Debe a Quién</h2>
            ${balances.length === 0 ? `
              <div style="text-align: center; padding: 30px; background: #e8f5e9; border-radius: 8px;">
                <p style="color: #4CAF50; font-size: 18px; font-weight: bold;">✓ ¡Todo está balanceado!</p>
                <p style="color: #666;">Todos han pagado su parte justa</p>
              </div>
            ` : balances.map(bal => `
              <div class="balance-item">
                <strong>${bal.from}</strong> debe a <strong>${bal.to}</strong>: 
                <span class="amount">$${bal.amount.toFixed(2)}</span>
              </div>
            `).join('')}

            <div class="footer">
              <p>Reporte generado por App de Gastos Compartidos</p>
              <p>© ${new Date().getFullYear()}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Reporte de Gastos',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Éxito', 'PDF generado correctamente');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        <View className="bg-white p-5 rounded-lg mb-5 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            📊 Resumen del Reporte
          </Text>
          
          <View className="flex-row justify-between py-3 border-b border-gray-200">
            <Text className="text-gray-600">Total de gastos:</Text>
            <Text className="font-bold text-gray-800">{expenses.length}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-gray-200">
            <Text className="text-gray-600">Monto total:</Text>
            <Text className="font-bold text-green-600 text-lg">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between py-3">
            <Text className="text-gray-600">Balances pendientes:</Text>
            <Text className="font-bold text-orange-600">{balances.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          className={`p-5 rounded-lg items-center shadow-sm ${
            generating || expenses.length === 0 ? 'bg-gray-400' : 'bg-blue-500'
          }`}
          onPress={generatePDF}
          disabled={generating || expenses.length === 0}
        >
          {generating ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white text-lg font-bold ml-3">
                Generando PDF...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="document-text" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Generar y Compartir PDF
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {expenses.length === 0 && (
          <View className="bg-yellow-50 p-4 rounded-lg mt-4 border-l-4 border-yellow-400">
            <Text className="text-yellow-800">
              <Text className="font-bold">Nota:</Text> Necesitas agregar al menos un gasto para generar el reporte.
            </Text>
          </View>
        )}

        <View className="bg-blue-50 p-5 rounded-lg mt-5 border-l-4 border-blue-400">
          <Text className="text-blue-800 font-bold mb-2">
            📄 ¿Qué incluye el reporte?
          </Text>
          <Text className="text-blue-700 text-sm leading-5">
            • Lista completa de todos los gastos{'\n'}
            • Total pagado por cada persona{'\n'}
            • Balances y deudas pendientes{'\n'}
            • Fecha de generación{'\n'}
            • Formato PDF profesional para compartir
          </Text>
        </View>

        {expenses.length > 0 && (
          <View className="bg-white p-5 rounded-lg mt-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              📝 Últimos Gastos a Incluir
            </Text>
            {expenses.slice(-3).reverse().map((expense) => (
              <View
                key={expense.id}
                className="py-3 border-b border-gray-100"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">
                      {expense.description}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {expense.paidByName} • {new Date(expense.date).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <Text className="text-green-600 font-bold ml-3">
                    ${expense.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
            {expenses.length > 3 && (
              <Text className="text-gray-500 text-sm text-center mt-3">
                ... y {expenses.length - 3} gastos más
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}