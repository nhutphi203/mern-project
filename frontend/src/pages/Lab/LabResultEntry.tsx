// frontend/src/pages/Lab/LabResultEntry.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEnterLabResult, useLabResults } from '@/hooks/useLab';
import { LabResult } from '../../api/lab.types';
import { toast } from 'sonner';

interface LabResultEntryProps {
    orderId?: string;
    testId?: string;
    onSuccess?: (result: LabResult) => void;
}

const LabResultEntry: React.FC<LabResultEntryProps> = ({
    orderId: propOrderId,
    testId: propTestId,
    onSuccess
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get orderId and testId from props or URL params
    const orderId = propOrderId || searchParams.get('orderId') || '';
    const testId = propTestId || searchParams.get('testId') || '';

    const { enterResult, loading } = useEnterLabResult();
    const { results: existingResults } = useLabResults({ orderId });

    const [formData, setFormData] = useState({
        value: '',
        unit: '',
        interpretation: '',
        comments: '',
        methodology: '',
        instrument: '',
    });

    const [testInfo, setTestInfo] = useState<{
        testName: string;
        category: string;
        normalRange?: { min: 12.0, max: 16.0, unit: 'g/dL' };
        patientName: string;
        orderNumber: string;
    } | null>(null);

    // Fetch test information when component mounts
    useEffect(() => {
        if (orderId && testId) {
            // In a real implementation, you would fetch test details from the API
            // For now, we'll simulate this data
            setTestInfo({
                testName: 'Complete Blood Count',
                category: 'Hematology',
                normalRange: { min: 12.0, max: 16.0, unit: 'g/dL' },
                patientName: 'John Doe',
                orderNumber: 'LAB000123',
            });
        }
    }, [orderId, testId]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateResult = (value: string): { isValid: boolean; flag?: string } => {
        if (!testInfo?.normalRange || !value) {
            return { isValid: true };
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            return { isValid: true };
        }

        const { min, max } = testInfo.normalRange;
        if (min && numericValue < min) {
            return { isValid: true, flag: 'Low' };
        }
        if (max && numericValue > max) {
            return { isValid: true, flag: 'High' };
        }

        return { isValid: true, flag: 'Normal' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId || !testId) {
            toast.error('Order ID and Test ID are required');
            return;
        }

        if (!formData.value) {
            toast.error('Result value is required');
            return;
        }

        try {
            const result = await enterResult({
                orderId,
                testId,
                result: {
                    value: formData.value,
                    unit: formData.unit,
                },
                interpretation: formData.interpretation,
                comments: formData.comments,
                methodology: formData.methodology,
                instrument: formData.instrument,
            });

            if (onSuccess) {
                onSuccess(result);
            } else {
                // Navigate back to lab queue or results view
                navigate('/technician/lab/queue');
            }
        } catch (error) {
            // Error is already handled in the hook with toast
            console.error('Failed to enter result:', error);
        }
    };

    const validation = validateResult(formData.value);

    if (!orderId || !testId) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-medium mb-2">Missing Parameters</div>
                    <div className="text-gray-600 mb-4">Order ID and Test ID are required</div>
                    <button
                        onClick={() => navigate('/technician/lab/queue')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Lab Queue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Enter Lab Result</h2>
                    {testInfo && (
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Order:</span> {testInfo.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Patient:</span> {testInfo.patientName}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Test:</span> {testInfo.testName}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Category:</span> {testInfo.category}
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Normal Range Display */}
                    {testInfo?.normalRange && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Normal Range</h4>
                            <p className="text-sm text-blue-800">
                                {testInfo.normalRange.min} - {testInfo.normalRange.max} {testInfo.normalRange.unit}
                            </p>
                        </div>
                    )}

                    {/* Result Value */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Result Value *
                            </label>
                            <input
                                type="text"
                                value={formData.value}
                                onChange={(e) => handleInputChange('value', e.target.value)}
                                placeholder="Enter result value"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {formData.value && validation.flag && (
                                <div className={`mt-1 text-sm ${validation.flag === 'Normal' ? 'text-green-600' :
                                    validation.flag === 'High' ? 'text-red-600' : 'text-orange-600'
                                    }`}>
                                    Flag: {validation.flag}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => handleInputChange('unit', e.target.value)}
                                placeholder="Unit"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Interpretation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interpretation
                        </label>
                        <textarea
                            value={formData.interpretation}
                            onChange={(e) => handleInputChange('interpretation', e.target.value)}
                            placeholder="Clinical interpretation of the result..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments
                        </label>
                        <textarea
                            value={formData.comments}
                            onChange={(e) => handleInputChange('comments', e.target.value)}
                            placeholder="Additional comments or notes..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Technical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Methodology
                            </label>
                            <input
                                type="text"
                                value={formData.methodology}
                                onChange={(e) => handleInputChange('methodology', e.target.value)}
                                placeholder="Test methodology"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Instrument
                            </label>
                            <input
                                type="text"
                                value={formData.instrument}
                                onChange={(e) => handleInputChange('instrument', e.target.value)}
                                placeholder="Instrument used"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/technician/lab/queue')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.value}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving Result...' : 'Save Result'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabResultEntry;