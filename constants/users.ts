import { User } from '../types/expense.types';

export const USERS: User[] = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Pedro' },
];

export const getUserName = (userId: string): string => {
  const user = USERS.find(u => u.id === userId);
  return user ? user.name : 'Desconocido';
};

export const getUserById = (userId: string): User | undefined => {
  return USERS.find(u => u.id === userId);
};