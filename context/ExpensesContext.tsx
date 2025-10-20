import React, { createContext, useState, useEffect, useContext } from 'react';
import { Expense, ExpensesContextType } from '../types/expense.types';
import { saveExpenses, loadExpenses } from '../utils/storage';

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpensesFromStorage();
  }, []);

  const loadExpensesFromStorage = async () => {
    try {
      setLoading(true);
      const loaded = await loadExpenses();
      setExpenses(loaded);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense): Promise<void> => {
    try {
      const newExpenses = [...expenses, expense];
      setExpenses(newExpenses);
      await saveExpenses(newExpenses);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, loading }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = (): ExpensesContextType => {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpensesProvider');
  }
  return context;
};