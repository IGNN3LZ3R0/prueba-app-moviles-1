import React, { createContext, useState, useEffect, useContext } from 'react';
import { Expense, ExpensesContextType } from '../types/expense.types';
import { saveExpenses, loadExpenses } from '../utils/storage';

const ContextoGastos = createContext<ExpensesContextType | undefined>(undefined);

export const ProveedorGastos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gastos, setGastos] = useState<Expense[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarGastosDeAlmacenamiento();
    }, []);

    const cargarGastosDeAlmacenamiento = async () => {
        try {
            setCargando(true);
            const gastosGuardados = await loadExpenses();
            setGastos(gastosGuardados);
        } catch (error) {
            console.error('Error al cargar los gastos:', error);
        } finally {
            setCargando(false);
        }
    };

    const agregarGasto = async (gasto: Expense): Promise<void> => {
        try {
            const nuevosGastos = [...gastos, gasto];
            setGastos(nuevosGastos);
            await saveExpenses(nuevosGastos);
        } catch (error) {
            console.error('Error al agregar el gasto:', error);
            throw error;
        }
    };

    return (
        <ContextoGastos.Provider value={{ expenses: gastos, addExpense: agregarGasto, loading: cargando }}>
            {children}
        </ContextoGastos.Provider>
    );
};

export const useGastos = (): ExpensesContextType => {
    const contexto = useContext(ContextoGastos);
    if (!contexto) {
        throw new Error('useGastos debe ser usado dentro de ProveedorGastos');
    }
    return contexto;
};
