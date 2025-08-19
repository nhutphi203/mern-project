import React, { useState, useEffect, useMemo } from 'react';
import { useLabResults } from '@/hooks/useLab';
import { LabResult } from '@/api/lab.types';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter, Download, Eye, Search } from 'lucide-react';

// Define nested property path accessor type
type PropertyPath<T> = string;

// Type-safe property access utility
function getNestedValue<T>(
    obj: T,
    path: string
): unknown {
    if (!obj) return null;

    return path.split('.').reduce((acc: unknown, part: string) => {
        if (acc === null || acc === undefined || typeof acc !== 'object') {
            return null;
        }
        return (acc as Record<string, unknown>)[part];
    }, obj as unknown);
}

const LabResultTable: React.FC = () => {
    const [patientFilter, setPatientFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: PropertyPath<LabResult>; direction: 'asc' | 'desc' } | null>(null);
    const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sử dụng hook với patientId để đảm bảo API không bị lỗi
    // Trong ứng dụng thực, bạn nên sử dụng context hoặc Redux để lấy ID của bệnh nhân hiện tại
    // Hoặc cung cấp một cách chọn bệnh nhân/order để hiển thị kết quả
    const patientIdFromContext = localStorage.getItem('currentPatientId');
    const params = patientIdFromContext ? { patientId: patientIdFromContext } : undefined;

    // Hiện tại, chúng ta không gọi API vì không có patientId hoặc orderId
    const { results, loading, error, refetch } = useLabResults(params);

    // DEBUG: Kiểm tra dữ liệu nhận được trong component
    console.log('LabResultTable component received:', {
        hasResults: Array.isArray(results),
        resultsLength: results?.length || 0,
        isLoading: loading,
        hasError: Boolean(error),
        errorMessage: error || 'No error',
        params
    });

    // Filter results based on search query and active tab
    const filteredResults = useMemo(() => {
        // DEBUG: Kiểm tra dữ liệu trước khi lọc
        console.log('Filtering data:', {
            resultsExist: Boolean(results),
            resultsIsArray: Array.isArray(results),
            resultsLength: results?.length || 0,
            firstResultIfExists: results && results.length > 0 ?
                JSON.stringify(results[0]).substring(0, 100) + '...' : 'No results'
        });

        if (!results) return [];

        let filtered = [...results];

        // Apply patient filter if provided
        if (patientFilter) {
            filtered = filtered.filter(result =>
                result.patientId?.toString() === patientFilter
            );
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(result =>
                (result.testId?.testName?.toLowerCase().includes(query) || false) ||
                (result.testId?.category?.toLowerCase().includes(query) || false) ||
                (result.result?.value?.toString().toLowerCase().includes(query) || false)
            );
        }

        // Apply tab filter
        if (activeTab === 'abnormal') {
            filtered = filtered.filter(result => result.result?.isAbnormal === true);
        } else if (activeTab === 'normal') {
            filtered = filtered.filter(result => result.result?.isAbnormal === false);
        }

        // Apply sorting if configured
        if (sortConfig) {
            filtered.sort((a: LabResult, b: LabResult) => {
                // Handle nested properties using our helper function
                let aValue = getNestedValue(a, sortConfig.key);
                let bValue = getNestedValue(b, sortConfig.key);

                // Handle date sorting
                if (sortConfig.key === 'performedAt') {
                    aValue = new Date(String(aValue)).getTime();
                    bValue = new Date(String(bValue)).getTime();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [results, patientFilter, searchQuery, activeTab, sortConfig]);

    // Handle sorting
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Get sort direction indicator
    const getSortDirectionIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const handleViewDetails = (result: LabResult) => {
        setSelectedResult(result);
        setIsModalOpen(true);
    };

    // Status badge color
    const getStatusBadge = (flag: string) => {
        switch (flag) {
            case 'Normal':
                return <Badge variant="outline" className="bg-green-100 text-green-800">Normal</Badge>;
            case 'High':
                return <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>;
            case 'Low':
                return <Badge variant="outline" className="bg-orange-100 text-orange-800">Low</Badge>;
            case 'Critical':
                return <Badge variant="outline" className="bg-red-200 text-red-900 font-bold">Critical</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-100 text-gray-800">{flag}</Badge>;
        }
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
                <h3 className="text-lg font-medium text-red-800">Error Loading Results</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button onClick={refetch} className="mt-2">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lab Results</CardTitle>
                            <CardDescription>View and manage laboratory test results</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="Search results..."
                                    className="pl-8 w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setPatientFilter('')}>
                                        All Patients
                                    </DropdownMenuItem>
                                    {/* Add patient filter options here */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm" onClick={refetch}>
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="all">All Results</TabsTrigger>
                            <TabsTrigger value="abnormal">Abnormal</TabsTrigger>
                            <TabsTrigger value="normal">Normal</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {filteredResults.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">No lab results found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchQuery || patientFilter ? "Try adjusting your filters" : "No results have been recorded yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => requestSort('testId.testName')}
                                        >
                                            <div className="flex items-center">
                                                Test
                                                {getSortDirectionIndicator('testId.testName')}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => requestSort('testId.category')}
                                        >
                                            <div className="flex items-center">
                                                Category
                                                {getSortDirectionIndicator('testId.category')}
                                            </div>
                                        </TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead>Reference Range</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => requestSort('performedAt')}
                                        >
                                            <div className="flex items-center">
                                                Date
                                                {getSortDirectionIndicator('performedAt')}
                                            </div>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResults.map((result) => (
                                        <TableRow key={result._id}>
                                            <TableCell className="font-medium">
                                                {/* Phòng trường hợp testId không phải là object hoặc không có thuộc tính testName */}
                                                {typeof result.testId === 'object' ? result.testId?.testName || 'N/A' :
                                                    typeof result.testId === 'string' ? result.testId : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {typeof result.testId === 'object' ? result.testId?.category || 'N/A' : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {typeof result.result === 'object' ?
                                                    `${result.result?.value || 'N/A'} ${result.result?.unit || ''}` :
                                                    result.result || 'N/A'}
                                            </TableCell>
                                            <TableCell>{result.referenceRange || 'N/A'}</TableCell>
                                            <TableCell>
                                                {result.result && typeof result.result === 'object' && result.result.flag ?
                                                    getStatusBadge(result.result.flag) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {result.performedAt ?
                                                    new Date(result.performedAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(result)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Lab Result Details</AlertDialogTitle>
                        <AlertDialogDescription>
                            Complete information about the selected lab test result
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {selectedResult && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Test</h4>
                                    <p className="font-medium">{selectedResult.testId.testName}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                                    <p>{selectedResult.testId.category}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Result</h4>
                                    <p className={selectedResult.result?.isAbnormal ? "font-bold text-red-700" : ""}>
                                        {selectedResult.result?.value || 'N/A'} {selectedResult.result?.unit || ''}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Reference Range</h4>
                                    <p>{selectedResult.referenceRange}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <p>{selectedResult.result?.flag ? getStatusBadge(selectedResult.result.flag) : 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Date Performed</h4>
                                    <p>{new Date(selectedResult.performedAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Performed By</h4>
                                    <p>
                                        {selectedResult.technicianId?.firstName || 'Unknown'} {selectedResult.technicianId?.lastName || ''}
                                    </p>
                                </div>
                                {selectedResult.verifiedBy && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Verified By</h4>
                                        <p>
                                            {selectedResult.verifiedBy?.firstName || 'Unknown'} {selectedResult.verifiedBy?.lastName || ''}
                                            {selectedResult.verifiedAt && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({new Date(selectedResult.verifiedAt).toLocaleDateString()})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {(selectedResult.interpretation || selectedResult.comments) && (
                                <div className="border-t pt-4 mt-4">
                                    {selectedResult.interpretation && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Interpretation</h4>
                                            <p className="text-gray-800">{selectedResult.interpretation}</p>
                                        </div>
                                    )}
                                    {selectedResult.comments && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Comments</h4>
                                            <p className="text-gray-800">{selectedResult.comments}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedResult.methodology && (
                                <div className="border-t pt-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Methodology</h4>
                                            <p className="text-gray-800">{selectedResult.methodology}</p>
                                        </div>
                                        {selectedResult.instrument && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Instrument</h4>
                                                <p className="text-gray-800">{selectedResult.instrument}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LabResultTable;
