import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExpensesProvider } from '../context/ExpensesContext';
import '../global.css';

export default function RootLayout() {
  return (
    <ExpensesProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            headerTitle: 'Gastos Compartidos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="balance"
          options={{
            title: 'Balance',
            headerTitle: 'Balance de Cuentas',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gallery"
          options={{
            title: 'Recibos',
            headerTitle: 'Galería de Recibos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="images" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Reporte',
            headerTitle: 'Generar Reporte',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add-expense"
          options={{
            href: null, // Ocultar del tab bar
          }}
        />
      </Tabs>
    </ExpensesProvider>
  );
}