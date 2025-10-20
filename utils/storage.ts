import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense.types';

const STORAGE_KEY = '@split_expenses';

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(expenses);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw error;
  }
};

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const clearExpenses = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing expenses:', error);
  }
};