import React, { useState, useEffect } from 'react';
import { LabTest, LabOrder } from '../../api/lab.types';
import { toast } from 'sonner';
// FIX: Use apiClient instead of raw axios for proper authentication
import { apiClient } from '../../api/apiClient';
import { useCurrentUser } from '../../hooks/useAuth'; // FIX: Add authentication check
interface LabOrderFormProps {
    encounterId: string;
    patientId: string;
    patientName: string;
    onSuccess: (order: LabOrder) => void;
    onCancel: () => void;
}

const LabOrderForm: React.FC<LabOrderFormProps> = ({
    encounterId,
    patientId,
    patientName,
    onSuccess,
    onCancel
}) => {
    // FIX: Add authentication check
    const { data: currentUser, isLoading: userLoading } = useCurrentUser();

    const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
    const [selectedTests, setSelectedTests] = useState<Array<{
        testId: string;
        priority: 'Routine' | 'Urgent' | 'STAT';
        instructions: string;
    }>>([]);
    const [clinicalInfo, setClinicalInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology'];

    useEffect(() => {
        // FIX: Only fetch tests if user is authenticated
        if (currentUser && !userLoading) {
            fetchAvailableTests();
        }
    }, [currentUser, userLoading]);

    const fetchAvailableTests = async () => {
        try {
            // FIX: Use apiClient with proper authentication
            const response = await apiClient.get('/api/v1/lab/tests');

            // FIX: Handle both possible response structures
            const tests = response.data.tests || response.data || [];
            setAvailableTests(tests);

            console.log('Fetched lab tests:', {
                totalTests: tests.length,
                categories: [...new Set(tests.map((t: LabTest) => t.category))]
            });
        } catch (error: unknown) {
            console.error('Error fetching lab tests:', error);

            // FIX: Better error handling with specific messages
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401) {
                toast.error('Please login to access lab tests');
            } else if (axiosError.response?.status === 403) {
                toast.error('You do not have permission to access lab tests');
            } else {
                toast.error('Failed to load available tests. Please try again.');
            }
        }
    };

    const handleTestSelection = (test: LabTest, selected: boolean) => {
        if (selected) {
            setSelectedTests(prev => [...prev, {
                testId: test._id,
                priority: 'Routine',
                instructions: ''
            }]);
        } else {
            setSelectedTests(prev => prev.filter(t => t.testId !== test._id));
        }
    };

    const updateTestPriority = (testId: string, priority: 'Routine' | 'Urgent' | 'STAT') => {
        setSelectedTests(prev =>
            prev.map(test =>
                test.testId === testId ? { ...test, priority } : test
            )
        );
    };

    const updateTestInstructions = (testId: string, instructions: string) => {
        setSelectedTests(prev =>
            prev.map(test =>
                test.testId === testId ? { ...test, instructions } : test
            )
        );
    };

    const calculateTotalAmount = () => {
        return selectedTests.reduce((total, selectedTest) => {
            const test = availableTests.find(t => t._id === selectedTest.testId);
            return total + (test?.price || 0);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // FIX: Add authentication check before submission
        if (!currentUser) {
            toast.error('Please login to create lab orders');
            return;
        }

        if (selectedTests.length === 0) {
            toast.error('Please select at least one test');
            return;
        }

        // FIX: Add validation for required fields that backend expects
        if (!patientId) {
            toast.error('Patient ID is required');
            return;
        }

        if (!encounterId) {
            toast.error('Encounter ID is required');
            return;
        }

        // FIX: Validate that all selected tests have required data
        const invalidTests = selectedTests.filter(test => !test.testId || !test.priority);
        if (invalidTests.length > 0) {
            toast.error('Some tests are missing required information');
            return;
        }

        setLoading(true);

        try {
            // FIX: Correct field mapping to match backend expectations
            const labOrderData = {
                encounterId, // Backend expects 'encounterId'
                patientId,   // Backend expects 'patientId'
                tests: selectedTests.map(test => ({
                    testId: test.testId,
                    priority: test.priority,
                    instructions: test.instructions
                })),
                clinicalInfo
                // FIX: Remove orderingProvider - backend uses req.user._id as doctorId automatically
            };

            console.log('Sending lab order data:', labOrderData);

            // FIX: Use apiClient with proper authentication
            const response = await apiClient.post('/api/v1/lab/orders', labOrderData);

            console.log('Lab order created successfully:', response.data);
            toast.success('Lab order created successfully');

            // FIX: Handle multiple possible response structures
            const createdOrder = response.data.order || response.data.labOrder || response.data;
            onSuccess(createdOrder);
        } catch (error: unknown) {
            console.error('Error creating lab order:', error);

            // FIX: Better error handling with specific messages and debug info
            const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, unknown> } } };

            if (axiosError.response?.status === 401) {
                toast.error('Please login to create lab orders');
            } else if (axiosError.response?.status === 403) {
                toast.error('You do not have permission to create lab orders');
            } else if (axiosError.response?.status === 400) {
                // Handle validation errors specifically
                const errorMessage = axiosError.response.data?.message || 'Invalid data provided';
                toast.error(`Validation Error: ${errorMessage}`);
                console.error('Validation errors:', axiosError.response.data?.errors);
            } else if (axiosError.response?.data?.message) {
                toast.error(axiosError.response.data.message);
            } else {
                toast.error('Failed to create lab order. Please try again.');
            }

            // FIX: Log error details for debugging (without referencing labOrderData outside scope)
            console.error('Full error details:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    const isTestSelected = (testId: string) => {
        return selectedTests.some(t => t.testId === testId);
    };

    // Filter tests based on search term and category
    const filteredTests = availableTests.filter(test => {
        const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.testCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || test.category === selectedCategory;
        return matchesSearch && matchesCategory && test.isActive;
    });

    // FIX: Show loading state while checking authentication
    if (userLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    // FIX: Show authentication required message
    if (!currentUser) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-lg text-red-600 mb-2">Authentication Required</div>
                        <div className="text-gray-600">Please login to create lab orders.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Lab Order</h2>
                <p className="text-gray-600">Patient: <span className="font-semibold">{patientName}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Clinical Information */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Information
                    </label>
                    <textarea
                        value={clinicalInfo}
                        onChange={(e) => setClinicalInfo(e.target.value)}
                        placeholder="Enter clinical history, symptoms, or relevant information..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Tests */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Available Tests</h3>
                            <div className="text-sm text-gray-600">
                                {filteredTests.length} tests available
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search tests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tests List */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {/* FIX: Show appropriate feedback based on data state */}
                            {availableTests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-lg mb-2">No Tests Available</div>
                                    <div className="text-sm">Please ensure tests are configured in the system.</div>
                                </div>
                            ) : filteredTests.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-lg mb-2">No Tests Match Your Filter</div>
                                    <div className="text-sm">
                                        {selectedCategory && `No tests found in "${selectedCategory}" category`}
                                        {searchTerm && ` matching "${searchTerm}"`}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('');
                                        }}
                                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                filteredTests.map((test) => (
                                    <div
                                        key={test._id}
                                        className={`p-3 border rounded-md transition-colors ${isTestSelected(test._id)
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={isTestSelected(test._id)}
                                                onChange={(e) => handleTestSelection(test, e.target.checked)}
                                                className="mt-1 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900">{test.testName}</div>
                                                <div className="text-sm text-gray-600 flex items-center space-x-4">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {test.category}
                                                    </span>
                                                    <span>${test.price.toFixed(2)}</span>
                                                    <span>{test.turnaroundTime}h turnaround</span>
                                                    <span className="capitalize">{test.specimen}</span>
                                                </div>
                                                {test.instructions && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {test.instructions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Selected Tests */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Selected Tests</h3>
                            <div className="text-sm text-gray-600">
                                {selectedTests.length} selected
                            </div>
                        </div>

                        {selectedTests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No tests selected
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedTests.map((selectedTest) => {
                                    const test = availableTests.find(t => t._id === selectedTest.testId);
                                    if (!test) return null;

                                    return (
                                        <div key={selectedTest.testId} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium text-gray-900">{test.testName}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTestSelection(test, false)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                                    <select
                                                        value={selectedTest.priority}
                                                        onChange={(e) => updateTestPriority(selectedTest.testId, e.target.value as "Routine" | "Urgent" | "STAT")}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                    >
                                                        <option value="Routine">Routine</option>
                                                        <option value="Urgent">Urgent</option>
                                                        <option value="STAT">STAT</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                                                    <textarea
                                                        value={selectedTest.instructions}
                                                        onChange={(e) => updateTestInstructions(selectedTest.testId, e.target.value)}
                                                        placeholder="Special instructions for this test..."
                                                        rows={2}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-2 text-right text-sm font-medium text-gray-900">
                                                ${test.price.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Total Amount */}
                                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">Total Amount:</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            ${calculateTotalAmount().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={selectedTests.length === 0 || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Order...' : `Create Lab Order (${selectedTests.length} tests)`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LabOrderForm;
