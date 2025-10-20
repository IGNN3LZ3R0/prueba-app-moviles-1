export interface User {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // ID del usuario
  paidByName: string; // Nombre del usuario
  participants: string[]; // IDs de participantes
  receiptUri: string; // URI de la foto
  date: string; // ISO string
}

export interface Balance {
  from: string; // Nombre
  to: string; // Nombre
  amount: number;
}

export interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => Promise<void>;
  loading: boolean;
}