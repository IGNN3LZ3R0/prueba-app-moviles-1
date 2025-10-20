import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Expense, Balance } from '../types/expense.types';

export const generatePDFReport = async (
  expenses: Expense[],
  balances: Balance[],
  totalsByPerson: { [name: string]: number }
): Promise<string> => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
            line-height: 1.6;
          }
          h1 {
            color: #4CAF50;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #666;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .header-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
          }
          .total-box {
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .total-amount {
            font-size: 36px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .balance-positive {
            color: #4CAF50;
            font-weight: bold;
          }
          .balance-negative {
            color: #f44336;
            font-weight: bold;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .person-name {
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>📊 Reporte de Gastos Compartidos</h1>
        
        <div class="header-info">
          <p><strong>Fecha del reporte:</strong> ${currentDate}</p>
          <p><strong>Total de gastos registrados:</strong> ${expenses.length}</p>
        </div>

        <div class="total-box">
          <div>TOTAL GASTADO</div>
          <div class="total-amount">$${totalAmount.toFixed(2)}</div>
        </div>

        <h2>💰 Resumen por Persona</h2>
        <table>
          <thead>
            <tr>
              <th>Persona</th>
              <th>Total Gastado</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(totalsByPerson)
              .map(([name, total]) => `
                <tr>
                  <td class="person-name">${name}</td>
                  <td>$${total.toFixed(2)}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>

        <h2>📝 Detalle de Gastos</h2>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Persona</th>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .map(expense => `
                <tr>
                  <td>${expense.description}</td>
                  <td>${expense.paidByName}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                  <td>${new Date(expense.date).toLocaleDateString('es-ES')}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>

        <h2>⚖️ Balance de Cuentas</h2>
        <table>
          <thead>
            <tr>
              <th>Desde</th>
              <th>Hacia</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${balances
              .map(balance => `
                <tr>
                  <td class="person-name">${balance.from}</td>
                  <td class="person-name">${balance.to}</td>
                  <td class="balance-negative">$${balance.amount.toFixed(2)}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Reporte generado automáticamente</p>
          <p>${currentDate}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

export const sharePDF = async (uri: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir reporte de gastos',
        UTI: 'com.adobe.pdf'
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }
  } catch (error) {
    console.error('Error al compartir PDF:', error);
    throw new Error('No se pudo compartir el PDF');
  }
};