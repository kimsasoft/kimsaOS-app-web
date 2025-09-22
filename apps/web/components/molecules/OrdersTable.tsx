import React from 'react';

interface Order {
  id: string;
  number: string;
  total: string;
  status: string;
  created_at: string;
}

interface OrdersTableProps {
  orders: Order[];
  title?: string;
  emptyMessage?: string;
}

export function OrdersTable({ 
  orders, 
  title = "Órdenes Recientes", 
  emptyMessage = "No hay órdenes" 
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-foreground">{emptyMessage}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Comienza creando tu primera orden.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      
      <div className="p-6">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {order.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    ${order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}