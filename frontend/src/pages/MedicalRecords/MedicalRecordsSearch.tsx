// src/pages/MedicalRecords/MedicalRecordsSearch.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useMedicalRecordsSearch, useMedicalRecords } from '@/hooks/useMedicalRecords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search,
    Filter,
    Calendar,
    User,
    FileText,
    Activity,
    AlertCircle,
    CheckCircle,
    Loader2,
    Eye,
    Download,
    RefreshCw,
    X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MedicalRecordsSearch: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const userRole = currentUser?.user?.role;

    // Search functionality
    const { data: searchResults, total, loading: searchLoading, error: searchError, searchRecords, clearSearch } = useMedicalRecordsSearch();

    // Get all records for initial display (with pagination)
    const { data: allRecords, pagination, loading: allRecordsLoading, error: allRecordsError, refetch } = useMedicalRecords({
        page: 1,
        limit: 20
    });

    // Search form state
    const [searchForm, setSearchForm] = useState({
        query: '',
        patientName: '',
        diagnosis: '',
        icd10Code: '',
        doctorName: '',
        dateFrom: '',
        dateTo: '',
        status: '',
        priority: ''
    });

    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Get data to display (search results if searching, all records otherwise)
    const displayData = isSearching ? searchResults : allRecords;
    const loading = isSearching ? searchLoading : allRecordsLoading;
    const error = isSearching ? searchError : allRecordsError;

    // Handle search form changes
    const handleSearchFormChange = (field: string, value: string) => {
        setSearchForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle search
    const handleSearch = async () => {
        if (!Object.values(searchForm).some(value => value.trim())) {
            return;
        }

        setIsSearching(true);
        await searchRecords(searchForm);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchForm({
            query: '',
            patientName: '',
            diagnosis: '',
            icd10Code: '',
            doctorName: '',
            dateFrom: '',
            dateTo: '',
            status: '',
            priority: ''
        });
        setIsSearching(false);
        clearSearch();
        refetch();
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Active':
            case 'Under Treatment':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
            case 'Critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
            case 'Routine':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Search Patient Records
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Advanced search functionality for patient medical records
                    </p>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Search className="w-5 h-5 mr-2" />
                        Search Medical Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Main search bar */}
                    <div className="flex space-x-2">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by diagnosis, symptoms, or keywords..."
                                value={searchForm.query}
                                onChange={(e) => handleSearchFormChange('query', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Search
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        {isSearching && (
                            <Button variant="outline" onClick={handleClearSearch}>
                                <X className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Advanced filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-1">Patient Name</label>
                                <Input
                                    placeholder="Enter patient name"
                                    value={searchForm.patientName}
                                    onChange={(e) => handleSearchFormChange('patientName', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                                <Input
                                    placeholder="Enter diagnosis"
                                    value={searchForm.diagnosis}
                                    onChange={(e) => handleSearchFormChange('diagnosis', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">ICD-10 Code</label>
                                <Input
                                    placeholder="Enter ICD-10 code"
                                    value={searchForm.icd10Code}
                                    onChange={(e) => handleSearchFormChange('icd10Code', e.target.value)}
                                />
                            </div>

                            {(userRole === 'Admin' || userRole === 'Lab Technician') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Doctor Name</label>
                                    <Input
                                        placeholder="Enter doctor name"
                                        value={searchForm.doctorName}
                                        onChange={(e) => handleSearchFormChange('doctorName', e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={searchForm.status}
                                    onChange={(e) => handleSearchFormChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Under Treatment">Under Treatment</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select
                                    value={searchForm.priority}
                                    onChange={(e) => handleSearchFormChange('priority', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                    <option value="Routine">Routine</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date From</label>
                                <Input
                                    type="date"
                                    value={searchForm.dateFrom}
                                    onChange={(e) => handleSearchFormChange('dateFrom', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date To</label>
                                <Input
                                    type="date"
                                    value={searchForm.dateTo}
                                    onChange={(e) => handleSearchFormChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Search results info */}
                    {isSearching && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Found {total} result{total !== 1 ? 's' : ''}
                            </span>
                            <span>
                                Showing search results
                            </span>
                        </div>
                    )}

                    {!isSearching && pagination && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Showing {displayData?.length || 0} of {pagination.totalRecords} records
                            </span>
                            <span>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Medical Records List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        {isSearching ? 'Search Results' : 'All Medical Records'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                        <div className="space-x-2">
                                            <Skeleton className="h-6 w-16 inline-block" />
                                            <Skeleton className="h-6 w-16 inline-block" />
                                            <Skeleton className="h-8 w-20 inline-block" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayData && displayData.length > 0 ? (
                        <div className="space-y-4">
                            {displayData.map((record) => (
                                <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.patientId?.firstName} {record.patientId?.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {record.diagnosis?.primary?.description || 'No primary diagnosis'}
                                                </p>
                                                {record.chiefComplaint && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Chief Complaint: {record.chiefComplaint}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-2">
                                                    {record.diagnosis?.primary?.icd10Code && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {record.diagnosis.primary.icd10Code}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        Dr. {record.doctorId?.firstName} {record.doctorId?.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge className={`${getPriorityColor(record.priority)} text-xs`}>
                                            {record.priority}
                                        </Badge>
                                        <Badge className={`${getStatusColor(record.status)} text-xs`}>
                                            {record.status}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            {new Date(record.updatedAt).toLocaleDateString()}
                                        </span>
                                        <Link to={`/medical-records/enhanced/${record._id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {isSearching ? 'No medical records found matching your search criteria.' : 'No medical records found.'}
                            </p>
                            {isSearching && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearSearch}
                                    className="mt-4"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role-specific Actions */}
            {userRole === 'Doctor' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            <Link to="/medical-records/create">
                                <Button>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Create New Record
                                </Button>
                            </Link>
                            <Link to="/medical-records/overview">
                                <Button variant="outline">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MedicalRecordsSearch;
