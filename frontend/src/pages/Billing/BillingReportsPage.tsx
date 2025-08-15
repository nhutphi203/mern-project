import React, { useState } from 'react';
import { useBillingReports } from '@/hooks/useBilling';

const BillingReportsPage: React.FC = () => {
    const { generateReport, loading, report } = useBillingReports();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');

    const handleGenerate = async () => {
        await generateReport({ startDate, endDate, reportType });
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Billing Reports</h1>
            <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed')} className="border rounded px-3 py-2 w-full">
                        <option value="summary">Summary</option>
                        <option value="detailed">Detailed</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button disabled={loading} onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Generating...' : 'Generate'}</button>
                </div>
            </div>

            {report && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto">{JSON.stringify(report, null, 2)}</pre>
            )}
        </div>
    );
};

export default BillingReportsPage;


