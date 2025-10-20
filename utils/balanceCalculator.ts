import { Expense, Balance } from '../types/expense.types';
import { USERS, getUserName } from '../constants/users';

export const calculateBalances = (expenses: Expense[]): Balance[] => {
  if (expenses.length === 0) return [];

  const totalPaid: { [userId: string]: number } = {};
  const totalOwed: { [userId: string]: number } = {};

  USERS.forEach(user => {
    totalPaid[user.id] = 0;
    totalOwed[user.id] = 0;
  });

  expenses.forEach(expense => {
    totalPaid[expense.paidBy] += expense.amount;
    const perPerson = expense.amount / expense.participants.length;
    expense.participants.forEach(participantId => {
      totalOwed[participantId] += perPerson;
    });
  });

  const netBalance: { [userId: string]: number } = {};
  USERS.forEach(user => {
    netBalance[user.id] = totalPaid[user.id] - totalOwed[user.id];
  });

  const debtors = USERS
    .filter(u => netBalance[u.id] < -0.01)
    .map(u => ({ id: u.id, name: u.name, amount: Math.abs(netBalance[u.id]) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = USERS
    .filter(u => netBalance[u.id] > 0.01)
    .map(u => ({ id: u.id, name: u.name, amount: netBalance[u.id] }))
    .sort((a, b) => b.amount - a.amount);

  const balances: Balance[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debt = Math.min(debtors[i].amount, creditors[j].amount);
    
    if (debt > 0.01) {
      balances.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(debt * 100) / 100,
      });
    }

    debtors[i].amount -= debt;
    creditors[j].amount -= debt;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return balances;
};

export const calculateTotalByPerson = (expenses: Expense[]): { [name: string]: number } => {
  const totals: { [name: string]: number } = {};
  
  USERS.forEach(user => {
    totals[user.name] = 0;
  });

  expenses.forEach(expense => {
    const paidByName = getUserName(expense.paidBy);
    totals[paidByName] += expense.amount;
  });

  return totals;
};

export const calculateAverage = (expenses: Expense[]): number => {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return total / USERS.length;
};