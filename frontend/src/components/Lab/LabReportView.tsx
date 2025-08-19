import React, { useState, useEffect } from 'react';
import { useLabReport } from '@/hooks/useLab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { labService } from '@/api/lab.service';
import { Download, Printer, Share2 } from 'lucide-react';

    // Define types for the report data structure
interface LabTestResult {
    testName: string;
    category: string;
    status: string;
    result: {
        result: {
            value: string | number;
            unit?: string;
            isAbnormal: boolean;
            flag: string;
        };
        interpretation?: string;
        comments?: string;
    } | null;
    normalRange: {
        min?: number;
        max?: number;
        unit?: string;
        textRange?: string;
    };
}

interface LabReportData {
    report: {
        order: {
            orderId: string;
            orderedAt: string;
            completedAt?: string;
            status: string;
        };
        patient: {
            firstName: string;
            lastName: string;
            dob: string;
            gender: string;
            phone: string;
        };
        doctor: {
            firstName: string;
            lastName: string;
            doctorDepartment: string;
        };
        clinicalInfo?: string;
        tests: LabTestResult[];
    };
}interface LabReportViewProps {
    orderId: string;
}

const LabReportView: React.FC<LabReportViewProps> = ({ orderId }) => {
    const { generateReport, report, loading, error } = useLabReport();
    const [reportData, setReportData] = useState<LabReportData | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await generateReport(orderId);
                setReportData(data as LabReportData);
            } catch (error) {
                // Error is handled by the hook
            }
        };

        if (orderId) {
            fetchReport();
        }
    }, [orderId, generateReport]);

    const handleDownloadPDF = async () => {
        try {
            await labService.downloadLabReportPdf(orderId);
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to download PDF report');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <div className="text-red-500 text-lg font-medium mb-2">Error Loading Report</div>
                        <div className="text-gray-600 mb-4">{error}</div>
                        <Button onClick={() => generateReport(orderId)}>Try Again</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!reportData || !reportData.report) {
        return (
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-lg">No report data available</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { report: labReport } = reportData;
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto print:max-w-none">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold">Laboratory Report</h1>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 print:shadow-none print:border-0">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg print:bg-white">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Laboratory Report #{labReport.order.orderId}
                            </h2>
                            <p className="text-gray-600">
                                Date: {new Date(labReport.order.orderedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-600">
                                <span className="font-medium">Status: </span>
                                <span className={labReport.order.status === 'Completed' ? 'text-green-600 font-medium' : 'text-orange-500'}>
                                    {labReport.order.status}
                                </span>
                            </div>
                            {labReport.order.completedAt && (
                                <div className="text-gray-600">
                                    <span className="font-medium">Completed: </span>
                                    {new Date(labReport.order.completedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient & Doctor Info */}
                <div className="p-6 border-b border-gray-200 grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Patient Information</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Name:</td>
                                    <td>
                                        {labReport.patient.firstName} {labReport.patient.lastName}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Gender:</td>
                                    <td>{labReport.patient.gender}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Date of Birth:</td>
                                    <td>{new Date(labReport.patient.dob).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Contact:</td>
                                    <td>{labReport.patient.phone}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium mb-3">Referring Doctor</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Name:</td>
                                    <td>
                                        Dr. {labReport.doctor.firstName} {labReport.doctor.lastName}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-medium text-gray-600">Department:</td>
                                    <td>{labReport.doctor.doctorDepartment}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Clinical Information */}
                {labReport.clinicalInfo && (
                    <div className="p-6 border-b border-gray-200 bg-gray-50 print:bg-white">
                        <h3 className="text-lg font-medium mb-2">Clinical Information</h3>
                        <p className="text-gray-700">{labReport.clinicalInfo}</p>
                    </div>
                )}

                {/* Test Results */}
                <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">Test Results</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 print:bg-gray-200">
                                    <th className="px-4 py-2 text-left border-b-2">Test</th>
                                    <th className="px-4 py-2 text-left border-b-2">Result</th>
                                    <th className="px-4 py-2 text-left border-b-2">Reference Range</th>
                                    <th className="px-4 py-2 text-left border-b-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {labReport.tests.map((test: LabTestResult, index: number) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{test.testName}</div>
                                            <div className="text-xs text-gray-500">{test.category}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {test.result ? (
                                                <div className={test.result.result.isAbnormal ? "font-medium text-red-600" : ""}>
                                                    {test.result.result.value} {test.result.result.unit}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {test.normalRange?.textRange || 
                                             (test.normalRange?.min !== undefined && test.normalRange?.max !== undefined) ? 
                                                `${test.normalRange.min} - ${test.normalRange.max} ${test.normalRange.unit || ''}` : 
                                                'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {test.result ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${test.result.result.isAbnormal ? 
                                                        test.result.result.flag === 'High' ? 'bg-red-100 text-red-800' : 
                                                        test.result.result.flag === 'Low' ? 'bg-orange-100 text-orange-800' : 
                                                        'bg-yellow-100 text-yellow-800' : 
                                                        'bg-green-100 text-green-800'}`
                                                }>
                                                    {test.result.result.flag || 'Normal'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {test.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes and Comments */}
                <div className="p-6 border-t border-gray-200">
                    {labReport.tests
                        .filter((test: LabTestResult) => test.result && (test.result.interpretation || test.result.comments))
                        .map((test: LabTestResult, index: number) => (
                            <div key={index} className={`${index > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                                <h4 className="font-medium">{test.testName} - Notes</h4>
                                {test.result && test.result.interpretation && (
                                    <div className="mt-2">
                                        <div className="text-sm font-medium text-gray-600">Interpretation:</div>
                                        <div className="text-sm mt-1">{test.result.interpretation}</div>
                                    </div>
                                )}
                                {test.result && test.result.comments && (
                                    <div className="mt-2">
                                        <div className="text-sm font-medium text-gray-600">Comments:</div>
                                        <div className="text-sm mt-1">{test.result.comments}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 text-sm text-gray-500">
                    <p>This report contains confidential health information protected by privacy laws.</p>
                    <p className="mt-1">Report generated on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default LabReportView;
