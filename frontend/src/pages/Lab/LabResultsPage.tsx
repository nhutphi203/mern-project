// frontend/src/pages/Lab/LabResultsPage.tsx

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTestLabResults } from '@/hooks/useTestLab';
import { LabResult } from '@/api/lab.types';
import { Search, Filter, FileText, Download, Calendar, User, TestTube, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface LabResultsPageProps {
    showPatientInfo?: boolean; // False for patient view, true for doctor/admin view
}

const LabResultsPage: React.FC<LabResultsPageProps> = ({
    showPatientInfo = true,
}) => {
    const [filters, setFilters] = useState({
        patientId: '',
        orderId: '',
        status: 'Completed',
        search: '',
    });

    const [shouldLoadAllResults, setShouldLoadAllResults] = useState(true);

    // Tạo effectiveFilters đơn giản hơn  
    const effectiveFilters = useMemo(() => {
        return {
            status: filters.status || 'Completed',
            orderId: filters.orderId,
            patientId: shouldLoadAllResults ? undefined : filters.patientId
        };
    }, [shouldLoadAllResults, filters]);

    const { results, loading, error, refetch } = useTestLabResults(effectiveFilters);

    // Helper functions - Move before useMemo to avoid hoisting issues
    const getOrderDisplayId = useCallback((result: LabResult) => {
        // Backend populates orderId as object with orderId field
        if (typeof result.orderId === 'object' && result.orderId !== null) {
            return result.orderId.orderId || 'Unknown';
        }
        // If it's just a string ID
        return result.orderId || 'Unknown';
    }, []);

    const getPatientDisplayInfo = useCallback((result: LabResult) => {
        // Backend populates patientId with firstName, lastName
        if (typeof result.patientId === 'object' && result.patientId !== null) {
            return {
                id: result.patientId._id || 'Unknown',
                name: `${result.patientId.firstName || ''} ${result.patientId.lastName || ''}`.trim() || 'Unknown Patient'
            };
        }
        return {
            id: result.patientId || 'Unknown',
            name: 'Unknown Patient'
        };
    }, []);

    const getTechnicianDisplayName = useCallback((result: LabResult) => {
        // Backend always populates technicianId with firstName, lastName
        if (result.technicianId) {
            return `${result.technicianId.firstName || ''} ${result.technicianId.lastName || ''}`.trim() || 'Unknown Technician';
        }
        return 'Unknown Technician';
    }, []);

    // Debug logging for results
    useEffect(() => {
        console.log('LabResultsPage received results:', {
            count: results?.length || 0,
            sampleResult: results?.[0],
            loading,
            error,
            effectiveFilters
        });
    }, [results, loading, error, effectiveFilters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
        setShouldLoadAllResults(false);
    };

    const filteredResults = useMemo(() => {
        if (!results) return [];

        return results.filter(result => {
            const searchTerm = filters.search.toLowerCase();

            // Safe access to nested properties with fallbacks - handle null testId
            const testName = result.testId?.testName || 'Unknown Test';
            const testCategory = result.testId?.category || 'Uncategorized';
            const orderIdStr = String(getOrderDisplayId(result));
            const patientInfo = getPatientDisplayInfo(result);
            const patientIdStr = String(patientInfo.id);

            return (
                testName.toLowerCase().includes(searchTerm) ||
                testCategory.toLowerCase().includes(searchTerm) ||
                orderIdStr.toLowerCase().includes(searchTerm) ||
                patientIdStr.toLowerCase().includes(searchTerm)
            );
        });
    }, [results, filters.search, getOrderDisplayId, getPatientDisplayInfo]);

    const getStatusColor = (flag: string) => {
        switch (flag) {
            case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Low': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Critical': return 'bg-red-200 text-red-900 font-bold border-red-300';
            case 'Abnormal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getVerificationBadge = (result: LabResult) => {
        if (result.verifiedBy && result.verifiedAt) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
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
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-red-600 text-lg font-medium mb-2">Error Loading Results</div>
                    <div className="text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <TestTube className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Results</h1>
                            <p className="text-gray-600">View detailed laboratory test results</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Search & Filter</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search by test name, category, order ID..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Patient ID Filter - Only for doctors/admins */}
                    {showPatientInfo && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.patientId}
                                onChange={(e) => handleFilterChange('patientId', e.target.value)}
                                placeholder="Patient ID"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Order ID Filter */}
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.orderId}
                            onChange={(e) => handleFilterChange('orderId', e.target.value)}
                            placeholder="Lab Order ID"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                {/* Show All Results Toggle */}
                {showPatientInfo && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => setShouldLoadAllResults(!shouldLoadAllResults)}
                            className={`px-4 py-2 rounded-md transition-colors ${shouldLoadAllResults
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {shouldLoadAllResults ? 'Using All Results' : 'Show All Results'}
                        </button>
                        {shouldLoadAllResults && (
                            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                                Showing all results in the system
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results */}
            {!filteredResults || filteredResults.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-gray-500 text-lg font-medium mb-2">No results found</div>
                    <div className="text-gray-400 text-sm">
                        {showPatientInfo ? 'Try adjusting your search criteria' : 'No lab results available yet'}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Group results by order */}
                    {Object.entries(
                        filteredResults.reduce((groups: { [key: string]: LabResult[] }, result) => {
                            const orderId = String(getOrderDisplayId(result));
                            if (!groups[orderId]) {
                                groups[orderId] = [];
                            }
                            groups[orderId].push(result);
                            return groups;
                        }, {} as { [key: string]: LabResult[] })
                    ).map(([orderId, orderResults]) => {
                        const patientInfo = getPatientDisplayInfo(orderResults[0]);

                        return (
                            <div key={orderId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Order Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                                    Order #{orderId}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {orderResults[0]?.performedAt
                                                            ? new Date(orderResults[0].performedAt).toLocaleDateString()
                                                            : 'Unknown Date'}
                                                    </p>
                                                    {showPatientInfo && (
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <User className="h-4 w-4 mr-1" />
                                                            Patient: {String(patientInfo.name)} ({String(patientInfo.id)})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {getVerificationBadge(orderResults[0])}
                                            <button
                                                onClick={() => window.print()}
                                                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Print Report
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
                                                        Result Value
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Reference Range
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    {showPatientInfo && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Technician
                                                        </th>
                                                    )}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Verification
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {orderResults.map((result) => (
                                                    <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {result.testId?.testName || 'Test Name Not Available'}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {result.testId?.category || 'Category Unknown'}
                                                                </div>
                                                                {!result.testId && (
                                                                    <div className="text-xs text-red-500 mt-1">
                                                                        ⚠️ Test info missing
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {result.result?.value || 'N/A'}
                                                                {result.result?.unit && <span className="text-gray-500 ml-1">{result.result.unit}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result.referenceRange || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(result.result?.flag || 'Normal')}`}>
                                                                {result.result?.flag || 'Normal'}
                                                            </span>
                                                        </td>
                                                        {showPatientInfo && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {getTechnicianDisplayName(result)}
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                                result.status === 'Reviewed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                                    'bg-gray-100 text-gray-800 border border-gray-200'
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
                                        <div className="mt-6 space-y-4 border-t pt-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h4>
                                            {orderResults.map((result) => (
                                                (result.interpretation || result.comments) && (
                                                    <div key={`${result._id}-notes`} className="bg-gray-50 p-4 rounded-md">
                                                        <div className="text-sm font-medium text-gray-900 mb-2">
                                                            {result.testId?.testName || 'Unknown Test'}
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
                                        <div className="mt-6 pt-4 border-t border-gray-200 bg-green-50 rounded-md p-4">
                                            <div className="text-sm">
                                                <span className="font-medium text-green-800">Verified by: </span>
                                                <span className="text-green-700">
                                                    {getTechnicianDisplayName(orderResults[0])}
                                                </span>
                                                <span className="text-green-600 ml-2">
                                                    on {new Date(orderResults[0].verifiedAt!).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LabResultsPage;
