import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    Plus,
    FileText,
    Calendar,
    User,
    Activity,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useMedicalRecords } from '@/hooks/useMedicalRecords';
import { MedicalRecordsAPI, MedicalRecord } from '@/api/medicalRecords';
import { useCurrentUser } from '@/hooks/useAuth';
import MedicalRecordCard from '@/components/MedicalRecords/MedicalRecordCard';

const ManageMedicalRecords = () => {
    const { data: currentUser } = useCurrentUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const {
        data: records,
        loading,
        error,
        pagination,
        refetch
    } = useMedicalRecords({
        page: currentPage,
        limit: 10,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter && priorityFilter !== 'all' ? priorityFilter : undefined
    });

    const handleSearch = () => {
        // Implement search functionality
        refetch();
    };

    const handleDelete = async (record: MedicalRecord) => {
        try {
            await MedicalRecordsAPI.deleteRecord(record._id);
            toast.success('Medical record deleted successfully');
            refetch();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast.error('Failed to delete medical record');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Emergent':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Urgent':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'Routine':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading medical records...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <div className="text-red-500 mb-4">Error loading medical records</div>
                <Button onClick={() => refetch()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Medical Records</h1>
                    <p className="text-muted-foreground">
                        Administrative interface for managing all medical records
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Record
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination?.totalRecords || 0}</div>
                        <p className="text-xs text-muted-foreground">All medical records</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {records?.filter(r => r.status === 'Active').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {records?.filter(r =>
                                format(new Date(r.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                            ).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Created today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {records?.filter(r => r.priority === 'Urgent' || r.priority === 'Emergent').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Search Records</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name, diagnosis, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-48">
                            <label className="text-sm font-medium mb-2 block">Priority</label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All priorities</SelectItem>
                                    <SelectItem value="Routine">Routine</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="Emergent">Emergent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleSearch}>
                            <Filter className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Medical Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Medical Records ({pagination?.totalRecords || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {records && records.length > 0 ? (
                            <>
                                {records.map((record) => (
                                    <MedicalRecordCard
                                        key={record._id}
                                        record={record}
                                        showPatientInfo={true}
                                        showActions={true}
                                        userRole={currentUser?.user.role}
                                    />
                                ))}

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalRecords)} of {pagination.totalRecords} records
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage <= 1}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm">
                                                Page {currentPage} of {pagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                                disabled={currentPage >= pagination.totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Medical Records Found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {searchTerm || statusFilter || priorityFilter
                                        ? 'No records match your current filters.'
                                        : 'There are no medical records in the system yet.'
                                    }
                                </p>
                                <Button onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    refetch();
                                }}>
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the medical record for {selectedRecord?.patientId?.firstName} {selectedRecord?.patientId?.lastName}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => selectedRecord && handleDelete(selectedRecord)}
                        >
                            Delete Record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageMedicalRecords;
