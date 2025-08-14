import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '@/api/billing.types';
import { toast } from 'sonner'; // Đảm bảo bạn đã import toast
import { LabOrder } from '@/api/lab.types';
import { Prescription, PopulatedPrescription } from '@/api/types';
// Trong component
interface InvoiceFormProps {
    encounterId: string;
    patientId: string;
    appointmentId: string;
    patientName: string;
    onSuccess: (invoice: Invoice) => void;
    onCancel: () => void;
}
interface AdditionalItem {
    description: string;
    serviceCode: string;
    unitPrice: number;
}
const InvoiceForm: React.FC<InvoiceFormProps> = ({
    encounterId,
    patientId,
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}) => {
    const [consultationFee, setConsultationFee] = useState<number>(0);
    const [labOrders, setLabOrders] = useState<string[]>([]);
    const [prescriptions, setPrescriptions] = useState<string[]>([]);
    const [additionalItems, setAdditionalItems] = useState<Array<{
        type: string;
        description: string;
        serviceCode: string;
        quantity: number;
        unitPrice: number;
    }>>([]);
    const [loading, setLoading] = useState(false);
    const [availableLabOrders, setAvailableLabOrders] = useState<LabOrder[]>([]);
    const [availablePrescriptions, setAvailablePrescriptions] = useState<Prescription[]>([]);

    useEffect(() => {
        fetchEncounterData();
    }, []);

    const fetchEncounterData = async () => {
        try {
            // Fetch lab orders for this encounter
            const labResponse = await fetch(`/api/v1/lab/results?encounterId=${encounterId}`, {
                credentials: 'include'
            });
            if (labResponse.ok) {
                const labData = await labResponse.json();
                setAvailableLabOrders(labData.orders || []);
            }

            // Fetch prescriptions for this encounter
            const prescResponse = await fetch(`/api/v1/prescriptions/encounter/${encounterId}`, {
                credentials: 'include'
            });
            if (prescResponse.ok) {
                const prescData = await prescResponse.json();
                setAvailablePrescriptions(prescData.prescriptions || []);
            }
        } catch (error) {
            console.error('Error fetching encounter data:', error);
        }
    };

    const addAdditionalItem = () => {
        setAdditionalItems([...additionalItems, {
            type: 'Procedure',
            description: '',
            serviceCode: '',
            quantity: 1,
            unitPrice: 0
        }]);
    };

    const updateAdditionalItem = (index: number, field: string, value: unknown) => {
        const updated = [...additionalItems];
        updated[index] = { ...updated[index], [field]: value };
        setAdditionalItems(updated);
    };

    const removeAdditionalItem = (index: number) => {
        setAdditionalItems(additionalItems.filter((_, i) => i !== index));
    };

    const calculateEstimatedTotal = () => {
        let total = consultationFee;

        // Add lab order costs
        const selectedLabOrders = availableLabOrders.filter(order => labOrders.includes(order._id));
        total += selectedLabOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Add additional items
        total += additionalItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        return total;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/v1/billing/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    encounterId,
                    patientId,
                    appointmentId,
                    consultationFee: consultationFee || 0,
                    labOrders,
                    prescriptions,
                    procedures: [], // Could be added later
                    additionalItems: additionalItems.filter((item: AdditionalItem) =>
                        item.description && item.serviceCode && item.unitPrice > 0
                    )
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create invoice');
            }

            const data = await response.json();
            toast.success('Invoice created successfully');
            onSuccess(data.invoice);
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Invoice</h2>
                <p className="text-gray-600">Patient: <span className="font-semibold">{patientName}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Consultation Fee */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fee
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                            className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Lab Orders */}
                {availableLabOrders.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lab Orders
                        </label>
                        <div className="space-y-2">
                            {availableLabOrders.map((order) => (
                                <div key={order._id} className="flex items-center space-x-3 p-3 border rounded-md">
                                    <input
                                        type="checkbox"
                                        checked={labOrders.includes(order._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setLabOrders([...labOrders, order._id]);
                                            } else {
                                                setLabOrders(labOrders.filter(id => id !== order._id));
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">Order #{order.orderId}</div>
                                        <div className="text-sm text-gray-600">
                                            {order.tests.length} test{order.tests.length !== 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Items */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Additional Items
                        </label>
                        <button
                            type="button"
                            onClick={addAdditionalItem}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Add Item
                        </button>
                    </div>

                    {additionalItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-md mb-3">
                            <div>
                                <select
                                    value={item.type}
                                    onChange={(e) => updateAdditionalItem(index, 'type', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                >
                                    <option value="Procedure">Procedure</option>
                                    <option value="Room">Room</option>
                                    <option value="Consultation">Consultation</option>
                                </select>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateAdditionalItem(index, 'description', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Code"
                                    value={item.serviceCode}
                                    onChange={(e) => updateAdditionalItem(index, 'serviceCode', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateAdditionalItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => updateAdditionalItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                />
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAdditionalItem(index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Estimated Total */}
                <div className="p-4 bg-gray-100 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Estimated Total:</span>
                        <span className="text-xl font-bold text-blue-600">
                            ${calculateEstimatedTotal().toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating Invoice...' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;