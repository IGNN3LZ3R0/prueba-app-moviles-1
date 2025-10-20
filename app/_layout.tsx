import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProveedorGastos } from '../context/ExpensesContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import '../global.css';

export default function RootLayout() {
  return (
    <ProveedorGastos>
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#3B82F6', // Azul activo
              tabBarInactiveTintColor: '#9CA3AF', // Gris inactivo
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
              },
              tabBarItemStyle: {
                marginTop: 0,
              },
              tabBarHideOnKeyboard: true, // Oculta tab bar al abrir teclado
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Inicio',
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? 'home' : 'home-outline'}
                    size={24}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="balance"
              options={{
                title: 'Balance',
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? 'pie-chart' : 'pie-chart-outline'}
                    size={24}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="gallery"
              options={{
                title: 'Recibos',
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? 'images' : 'images-outline'}
                    size={24}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="report"
              options={{
                title: 'Reporte',
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? 'document-text' : 'document-text-outline'}
                    size={24}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="add-expense"
              options={{
                href: null, // Oculto del tab bar
                headerShown: false,
              }}
            />
          </Tabs>
        </View>
      </SafeAreaView>
    </ProveedorGastos>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 0, // SafeAreaView ya maneja notch
  },
  innerContainer: {
    flex: 1,
  },
});
