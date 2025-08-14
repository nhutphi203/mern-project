import React, { useState, useEffect } from 'react';
import { LabOrder } from '@/api/lab.types';
import { toast } from 'sonner';
import { LabOrderTest } from '@/api/lab.types';
const LabQueue: React.FC = () => {
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'Pending',
        priority: '',
        category: ''
    });

    const priorities = ['STAT', 'Urgent', 'Routine'];
    const categories = ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology'];

    useEffect(() => {
        fetchLabQueue();
    }, [filters]);

    const fetchLabQueue = async () => {
        try {
            const queryParams = new URLSearchParams(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );

            const response = await fetch(`/api/v1/lab/queue?${queryParams}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch lab queue');

            const data = await response.json();
            setOrders(data.orders);
        } catch (error) {
            console.error('Error fetching lab queue:', error);
            toast('Failed to load lab queue');
        } finally {
            setLoading(false);
        }
    };

    const updateTestStatus = async (orderId: string, testId: string, status: string) => {
        try {
            const response = await fetch(`/api/v1/lab/orders/${orderId}/tests/${testId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update test status');

            toast.success('Test status updated successfully');
            fetchLabQueue(); // Refresh the queue
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
            case 'Ordered': return 'bg-gray-100 text-gray-800';
            case 'Collected': return 'bg-yellow-100 text-yellow-800';
            case 'InProgress': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
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
                                <option value="Pending">Pending</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Completed">Completed</option>
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
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-500 text-lg">No orders found</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
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
                                            Patient: {order.patientId.firstName} {order.patientId.lastName}
                                            <span className="ml-2">({order.patientId.gender}, {new Date().getFullYear() - new Date(order.patientId.dob).getFullYear()} years)</span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Doctor: Dr. {order.doctorId.firstName} {order.doctorId.lastName} - {order.doctorId.doctorDepartment}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">
                                            Ordered: {new Date(order.orderedAt).toLocaleString()}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ${order.totalAmount.toFixed(2)}
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
                                    {order.tests.map((test, testIndex) => (
                                        <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mt-1">
                                                    {/* Hiển thị testId làm identifier */}
                                                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">Test ID: {test.testId}</span>

                                                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(test.priority)}`}>
                                                        {test.priority}
                                                    </span>

                                                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(test.status)}`}>
                                                        {test.status}
                                                    </span>

                                                    {/* Hiển thị instructions thay vì specimen */}
                                                    {test.instructions ? (
                                                        <span className="text-sm text-gray-600">
                                                            Instructions: {test.instructions}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            No instructions
                                                        </span>
                                                    )}

                                                    {/* Hiển thị status-based info thay vì turnaround time */}
                                                    <span className="text-sm text-gray-600">
                                                        {test.completedAt ? `Completed: ${new Date(test.completedAt).toLocaleDateString()}` :
                                                            test.collectedAt ? `Collected: ${new Date(test.collectedAt).toLocaleDateString()}` :
                                                                'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {test.status === 'Ordered' && (
                                                    <button
                                                        onClick={() => updateTestStatus(order._id, test.testId, 'Collected')}
                                                        className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                                    >
                                                        Mark Collected
                                                    </button>
                                                )}
                                                {test.status === 'Collected' && (
                                                    <button
                                                        onClick={() => updateTestStatus(order._id, test.testId, 'InProgress')}
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