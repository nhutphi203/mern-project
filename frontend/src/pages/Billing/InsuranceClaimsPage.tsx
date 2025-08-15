import React, { useState } from 'react';
import { useInvoices, useInsuranceClaim } from '@/hooks/useBilling';

const InsuranceClaimsPage: React.FC = () => {
    const { invoices } = useInvoices({ status: 'Sent' });
    const { submitClaim, updateClaimStatus, submitLoading, updateLoading } = useInsuranceClaim();
    const [invoiceId, setInvoiceId] = useState('');
    const [claimNumber, setClaimNumber] = useState('');
    const [claimStatus, setClaimStatus] = useState<'Pending' | 'Approved' | 'Denied' | 'Partial'>('Pending');
    const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
    const [denialReason, setDenialReason] = useState('');

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Insurance Claims</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded p-4 space-y-3">
                    <h2 className="font-semibold">Submit Claim</h2>
                    <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="border rounded px-3 py-2 w-full">
                        <option value="">Select Invoice</option>
                        {invoices?.map(inv => (
                            <option key={inv._id} value={inv._id}>{inv.invoiceNumber}</option>
                        ))}
                    </select>
                    <input value={claimNumber} onChange={(e) => setClaimNumber(e.target.value)} placeholder="Claim Number" className="border rounded px-3 py-2 w-full" />
                    <button disabled={!invoiceId || !claimNumber || submitLoading} onClick={() => submitClaim(invoiceId, claimNumber)} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {submitLoading ? 'Submitting...' : 'Submit Claim'}
                    </button>
                </div>

                <div className="bg-white border rounded p-4 space-y-3">
                    <h2 className="font-semibold">Update Claim Status</h2>
                    <select value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="border rounded px-3 py-2 w-full">
                        <option value="">Select Invoice</option>
                        {invoices?.map(inv => (
                            <option key={inv._id} value={inv._id}>{inv.invoiceNumber}</option>
                        ))}
                    </select>
                    <select value={claimStatus} onChange={(e) => setClaimStatus(e.target.value as any)} className="border rounded px-3 py-2 w-full">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Denied">Denied</option>
                        <option value="Partial">Partial</option>
                    </select>
                    <input type="number" value={approvedAmount ?? ''} onChange={(e) => setApprovedAmount(e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="Approved Amount" className="border rounded px-3 py-2 w-full" />
                    <input value={denialReason} onChange={(e) => setDenialReason(e.target.value)} placeholder="Denial Reason" className="border rounded px-3 py-2 w-full" />
                    <button
                        disabled={!invoiceId || updateLoading}
                        onClick={() => updateClaimStatus(invoiceId, { claimStatus, approvedAmount, denialReason })}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        {updateLoading ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsuranceClaimsPage;


