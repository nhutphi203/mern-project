// frontend/src/pages/Lab/LabResultsView.tsx

import React, { useState, useMemo } from 'react';
import { useLabResults, useLabReport } from '@/hooks/useLab';
import { labService } from '@/api/lab.service';
import { LabResult } from '../../api/lab.types';
import { toast } from 'sonner';

interface LabResultsViewProps {
    patientId?: string;
    orderId?: string;
    showPatientInfo?: boolean; // False for patient view, true for doctor/admin view
}

const LabResultsView: React.FC<LabResultsViewProps> = ({
    patientId,
    orderId,
    showPatientInfo = true,
}) => {
    const [filters, setFilters] = useState({
        patientId: patientId || '',
        orderId: orderId || '',
    });

    // For doctor/admin view, show all results by default
    // For patient view, use their own ID
    const [shouldLoadAllResults, setShouldLoadAllResults] = useState(true); // Always default to true

    // Use useMemo to stabilize effectiveFilters object
    const effectiveFilters = useMemo(() =>
        shouldLoadAllResults ? { patientId: 'all' } : filters,
        [shouldLoadAllResults, filters]
    );

    const { results, loading, error, refetch } = useLabResults(effectiveFilters);
    const { generateReport, loading: reportLoading } = useLabReport();

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGenerateReport = async (orderId: string) => {
        try {
            // Try PDF download first
            await labService.downloadLabReportPdf(orderId);
            toast.success('Report downloaded');
        } catch (e) {
            try {
                // Fallback to JSON generation
                const report = await generateReport(orderId);
                toast.success('Report generated successfully');
                console.log('Report:', report);
            } catch (error) {
                // handled in hook
            }
        }
    };

    const getStatusColor = (flag: string) => {
        switch (flag) {
            case 'Normal': return 'bg-green-100 text-green-800';
            case 'High': return 'bg-red-100 text-red-800';
            case 'Low': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-200 text-red-900 font-bold';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVerificationStatus = (result: LabResult) => {
        if (result.verifiedBy && result.verifiedAt) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Review
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-medium mb-2">Error Loading Results</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Lab Results</h1>

                {/* Filters - Only show for doctors/admins, not patients */}
                {showPatientInfo && (
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient ID
                                </label>
                                <input
                                    type="text"
                                    value={filters.patientId}
                                    onChange={(e) => handleFilterChange('patientId', e.target.value)}
                                    placeholder="Enter patient ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order ID
                                </label>
                                <input
                                    type="text"
                                    value={filters.orderId}
                                    onChange={(e) => handleFilterChange('orderId', e.target.value)}
                                    placeholder="Enter order ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setShouldLoadAllResults(!shouldLoadAllResults)}
                                    className={`px-4 py-2 rounded-md ${shouldLoadAllResults
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {shouldLoadAllResults ? 'Hide All Results' : 'Show All Results'}
                                </button>
                            </div>
                        </div>
                        {shouldLoadAllResults && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                <strong>Note:</strong> Showing all lab results in the system. Use filters above to narrow down results.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results */}
            {!results || results.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-500 text-lg">No results found</div>
                    <div className="text-gray-400 text-sm mt-2">
                        {showPatientInfo ? 'Try adjusting your search criteria' : 'No lab results available yet'}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Group results by order */}
                    {results.reduce((groups: { [key: string]: LabResult[] }, result) => {
                        const orderId = String(result.orderId || '');
                        if (!groups[orderId]) {
                            groups[orderId] = [];
                        }
                        groups[orderId].push(result);
                        return groups;
                    }, {} as { [key: string]: LabResult[] }) &&
                        Object.entries(
                            results.reduce((groups: { [key: string]: LabResult[] }, result) => {
                                const orderId = String(result.orderId || '');
                                if (!groups[orderId]) {
                                    groups[orderId] = [];
                                }
                                groups[orderId].push(result);
                                return groups;
                            }, {} as { [key: string]: LabResult[] })
                        ).map(([orderId, orderResults]) => (
                            <div key={orderId} className="bg-white rounded-lg shadow border border-gray-200">
                                {/* Order Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{String(orderResults[0]?.orderId || 'Unknown')}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Performed on: {orderResults[0]?.performedAt ? new Date(orderResults[0].performedAt).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getVerificationStatus(orderResults[0])}
                                            <button
                                                onClick={() => handleGenerateReport(orderId)}
                                                disabled={reportLoading}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {reportLoading ? 'Generating...' : 'Download Report'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Test Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Result
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Reference Range
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Flag
                                                    </th>
                                                    {showPatientInfo && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Technician
                                                        </th>
                                                    )}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {orderResults.map((result) => (
                                                    <tr key={result._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {result.testId.testName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {result.testId.category}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {result.result.value} {result.result.unit && result.result.unit}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.referenceRange}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.result.flag)}`}>
                                                                {result.result.flag}
                                                            </span>
                                                        </td>
                                                        {showPatientInfo && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {result.technicianId.firstName} {result.technicianId.lastName}
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                                result.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {result.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Interpretation and Comments */}
                                    {orderResults.some(r => r.interpretation || r.comments) && (
                                        <div className="mt-6 space-y-4">
                                            {orderResults.map((result) => (
                                                (result.interpretation || result.comments) && (
                                                    <div key={`${result._id}-notes`} className="border-t pt-4">
                                                        <div className="text-sm font-medium text-gray-900 mb-2">
                                                            {result.testId.testName} - Additional Notes
                                                        </div>
                                                        {result.interpretation && (
                                                            <div className="mb-2">
                                                                <span className="text-sm font-medium text-gray-700">Interpretation: </span>
                                                                <span className="text-sm text-gray-600">{result.interpretation}</span>
                                                            </div>
                                                        )}
                                                        {result.comments && (
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Comments: </span>
                                                                <span className="text-sm text-gray-600">{result.comments}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}

                                    {/* Verification Info */}
                                    {orderResults[0].verifiedBy && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 bg-green-50 rounded-md p-3">
                                            <div className="text-sm">
                                                <span className="font-medium text-green-800">Verified by: </span>
                                                <span className="text-green-700">
                                                    {orderResults[0].verifiedBy.firstName} {orderResults[0].verifiedBy.lastName}
                                                </span>
                                                <span className="text-green-600 ml-2">
                                                    on {new Date(orderResults[0].verifiedAt!).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default LabResultsView;