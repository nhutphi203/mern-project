import React, { useState } from 'react';
import { useInvoices, useProcessPayment } from '@/hooks/useBilling';

const PaymentsPage: React.FC = () => {
    const { invoices } = useInvoices({ status: 'Sent' });
    const { processPayment, loading } = useProcessPayment();
    const [selectedInvoice, setSelectedInvoice] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);

    const handlePay = async () => {
        if (!selectedInvoice || amount <= 0) return;
        await processPayment(selectedInvoice, { method: 'Cash', amount });
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Payments</h1>
            <div className="bg-white border rounded p-4 space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Invoice</label>
                    <select value={selectedInvoice} onChange={(e) => setSelectedInvoice(e.target.value)} className="border rounded px-3 py-2 w-full">
                        <option value="">Select Invoice</option>
                        {invoices?.map(inv => (
                            <option key={inv._id} value={inv._id}>
                                {inv.invoiceNumber} - Balance ${inv.balance}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} className="border rounded px-3 py-2 w-full" />
                </div>
                <div className="flex justify-end">
                    <button disabled={loading} onClick={handlePay} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Processing...' : 'Pay'}</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;


