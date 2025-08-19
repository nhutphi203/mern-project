import React, { useState } from 'react';
import { LabOrder } from '../../api/lab.types';
import { toast } from 'sonner';
import { useLabQueue } from '@/hooks/useLab';

const LabQueue: React.FC = () => {
    // FIX: Use 'Pending' to get newly created orders (order-level status)
    const [filters, setFilters] = useState({
        status: 'Pending', // New orders have order status 'Pending'
        priority: '',
        category: ''
    });

    const priorities = ['STAT', 'Urgent', 'Routine'];
    const categories = ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology'];
    // FIX: Include both order-level and test-level statuses
    const statuses = [
        'Pending',      // Order-level: newly created orders
        'Ordered',      // Test-level: individual tests ordered
        'Collected',    // Test-level: samples collected  
        'InProgress',   // Both levels: processing
        'Completed',    // Both levels: finished
        'Cancelled'     // Both levels: cancelled
    ];

    // Sử dụng hook useLabQueue để lấy dữ liệu thay vì fetch trực tiếp
    const {
        orders = [],
        loading,
        error,
        refetch: fetchLabQueue,
        updateTestStatus
    } = useLabQueue(filters);

    // Hàm updateTestStatus từ hook được sử dụng thay vì tự implement
    const handleUpdateTestStatus = (orderId: string, testId: string, status: string) => {
        try {
            updateTestStatus(orderId, testId, status);
            // Không cần gọi fetchLabQueue - hook sẽ tự động refresh
        } catch (error) {
            console.error('Error updating test status:', error);
            toast.error('Failed to update test status');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'STAT': return 'bg-red-100 text-red-800';
            case 'Urgent': return 'bg-orange-100 text-orange-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';     // New orders
            case 'Ordered': return 'bg-gray-100 text-gray-800';         // Individual tests ordered
            case 'Collected': return 'bg-blue-100 text-blue-800';       // Samples collected
            case 'InProgress': return 'bg-purple-100 text-purple-800';  // Processing
            case 'Completed': return 'bg-green-100 text-green-800';     // Finished
            case 'Cancelled': return 'bg-red-100 text-red-800';         // Cancelled
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Laboratory Queue</h1>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {/* FIX: Use correct status values that match backend enum */}
                                <option value="">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Items */}
            {/* FIX: Add error handling display */}
            {error ? (
                <div className="text-center py-12 bg-white rounded-lg shadow border border-red-200">
                    <div className="text-red-500 text-lg mb-2">Error Loading Lab Queue</div>
                    <div className="text-red-400 text-sm mb-4">{error}</div>
                    <button
                        onClick={() => fetchLabQueue()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            ) : !orders || orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-500 text-lg">No orders found</div>
                    <div className="text-gray-400 text-sm mt-2">
                        {/* FIX: Show current filter info for better debugging */}
                        Current filters: Status={filters.status || 'All'}, Priority={filters.priority || 'All'}, Category={filters.category || 'All'}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">Try adjusting your filters or creating a new lab order</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Order #{order.orderId}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Patient: {order.patientId?.firstName} {order.patientId?.lastName}
                                            {order.patientId && (
                                                <span className="ml-2">({order.patientId.gender}, {new Date().getFullYear() - new Date(order.patientId.dob).getFullYear()} years)</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Doctor: Dr. {order.doctorId?.firstName} {order.doctorId?.lastName}
                                            {order.doctorId?.doctorDepartment && ` - ${order.doctorId.doctorDepartment}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">
                                            Ordered: {new Date(order.orderedAt).toLocaleString()}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ${order.totalAmount?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                </div>

                                {order.clinicalInfo && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                        <div className="text-sm font-medium text-gray-700 mb-1">Clinical Information:</div>
                                        <div className="text-sm text-gray-600">{order.clinicalInfo}</div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="space-y-3">
                                    {order.tests?.map((test, testIndex) => (
                                        <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {test.testName || 'Unknown Test'}
                                                </div>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    {/* FIX: Show category instead of testId */}
                                                    {test.category && (
                                                        <span className="text-sm bg-gray-200 px-2 py-1 rounded">{test.category}</span>
                                                    )}

                                                    {test.priority && (
                                                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(test.priority)}`}>
                                                            {test.priority}
                                                        </span>
                                                    )}

                                                    {test.status && (
                                                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(test.status)}`}>
                                                            {test.status}
                                                        </span>
                                                    )}

                                                    {/* FIX: Add specimen and turnaround time info */}
                                                    {test.specimen && (
                                                        <span className="text-sm text-gray-600">
                                                            Specimen: {test.specimen}
                                                        </span>
                                                    )}

                                                    {test.turnaroundTime && (
                                                        <span className="text-sm text-gray-600">
                                                            TAT: {test.turnaroundTime}h
                                                        </span>
                                                    )}

                                                    {/* Hiển thị instructions nếu có */}
                                                    {test.instructions && (
                                                        <span className="text-sm text-gray-600">
                                                            Instructions: {test.instructions}
                                                        </span>
                                                    )}

                                                    {/* Hiển thị thời gian completed nếu có */}
                                                    {test.completedAt && (
                                                        <span className="text-sm text-gray-600">
                                                            Completed: {new Date(test.completedAt).toLocaleDateString()}
                                                        </span>
                                                    )}

                                                    {/* Hiển thị thời gian collected nếu có */}
                                                    {test.collectedAt && (
                                                        <span className="text-sm text-gray-600">
                                                            Collected: {new Date(test.collectedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {test.status === 'Ordered' && (
                                                    <button
                                                        onClick={() => handleUpdateTestStatus(order._id, test.testId, 'Collected')}
                                                        className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                                    >
                                                        Mark Collected
                                                    </button>
                                                )}
                                                {test.status === 'Collected' && (
                                                    <button
                                                        onClick={() => handleUpdateTestStatus(order._id, test.testId, 'InProgress')}
                                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >
                                                        Start Processing
                                                    </button>
                                                )}
                                                {test.status === 'InProgress' && (
                                                    <button
                                                        onClick={() => window.location.href = `/lab/results/enter?orderId=${order._id}&testId=${test.testId}`}
                                                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Enter Results
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LabQueue;
