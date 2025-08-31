import React from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useInvoices } from '@/hooks/useBilling';

const MyInvoicesPage: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const patientId = currentUser?.user?._id;
    const { invoices, loading, error, refetch } = useInvoices({ patientId });

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return (
        <div className="p-6">
            <div className="text-red-600 mb-2">{error}</div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={refetch}>Retry</button>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Invoices</h1>
            <div className="bg-white border rounded">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="p-3">Invoice #</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Paid</th>
                            <th className="p-3">Balance</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices?.map(inv => (
                            <tr key={inv._id} className="border-t">
                                <td className="p-3">{inv.invoiceNumber}</td>
                                <td className="p-3">${inv.totalAmount}</td>
                                <td className="p-3">${inv.totalPaid}</td>
                                <td className="p-3">${inv.balance}</td>
                                <td className="p-3">{inv.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyInvoicesPage;


