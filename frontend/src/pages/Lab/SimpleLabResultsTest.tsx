import React, { useEffect, useState } from 'react';

const SimpleLabResultsTest: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching lab results...');
            const response = await fetch('/api/v1/lab/test/results');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Raw API response:', data);

            setResults(data.results || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Simple Lab Results Test</h1>

                <div className="mb-4">
                    <button
                        onClick={fetchResults}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh Results'}
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="text-lg">Loading lab results...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-medium text-red-800">Error</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Lab Results ({results.length} found)</h2>
                        </div>

                        <div className="p-6">
                            {results.length === 0 ? (
                                <p className="text-gray-500">No lab results found</p>
                            ) : (
                                <div className="space-y-4">
                                    {results.map((result, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <strong>Order ID:</strong> {result.orderId?.orderId || result.orderId || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong>Test:</strong> {result.testId?.testName || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong>Result:</strong> {result.result?.value} {result.result?.unit}
                                                </div>
                                                <div>
                                                    <strong>Flag:</strong>
                                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${result.result?.flag === 'Normal' ? 'bg-green-100 text-green-800' :
                                                            result.result?.flag === 'High' ? 'bg-red-100 text-red-800' :
                                                                result.result?.flag === 'Low' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {result.result?.flag || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <strong>Reference Range:</strong> {result.referenceRange || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong>Date:</strong> {result.performedAt ? new Date(result.performedAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>

                                            {(result.interpretation || result.comments) && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    {result.interpretation && (
                                                        <div className="mb-2">
                                                            <strong>Interpretation:</strong> {result.interpretation}
                                                        </div>
                                                    )}
                                                    {result.comments && (
                                                        <div>
                                                            <strong>Comments:</strong> {result.comments}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleLabResultsTest;
