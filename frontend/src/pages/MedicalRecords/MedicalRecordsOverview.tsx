// src/pages/MedicalRecords/MedicalRecordsOverview.tsx
import React from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useMedicalRecordsOverview } from '@/hooks/useMedicalRecords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ClipboardList,
    Heart,
    Stethoscope,
    Search,
    PlusCircle,
    FileText,
    Activity,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MedicalRecordsOverview: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const { data: recentRecords, stats, loading, error, refetch } = useMedicalRecordsOverview();
    const userRole = currentUser?.user?.role;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-blue-100 text-blue-800';
            case 'Under Treatment': return 'bg-orange-100 text-orange-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleSpecificActions = () => {
        switch (userRole) {
            case 'Doctor':
                return [
                    {
                        label: 'Create Medical Record',
                        path: '/medical-records/create',
                        icon: <PlusCircle className="w-4 h-4" />,
                        color: 'bg-blue-600 hover:bg-blue-700'
                    },
                    {
                        label: 'CPOE Orders',
                        path: '/medical-records/cpoe',
                        icon: <Stethoscope className="w-4 h-4" />,
                        color: 'bg-green-600 hover:bg-green-700'
                    },
                    {
                        label: 'Search Patients',
                        path: '/medical-records/search',
                        icon: <Search className="w-4 h-4" />,
                        color: 'bg-orange-600 hover:bg-orange-700'
                    }
                ];
            case 'Admin':
                return [
                    {
                        label: 'Medical Reports',
                        path: '/medical-records/reports',
                        icon: <FileText className="w-4 h-4" />,
                        color: 'bg-indigo-600 hover:bg-indigo-700'
                    },
                    {
                        label: 'Manage Records',
                        path: '/medical-records/manage',
                        icon: <ClipboardList className="w-4 h-4" />,
                        color: 'bg-red-600 hover:bg-red-700'
                    }
                ];
            case 'Patient':
                return [
                    {
                        label: 'My Medical Records',
                        path: '/medical-records/my-records',
                        icon: <FileText className="w-4 h-4" />,
                        color: 'bg-blue-600 hover:bg-blue-700'
                    }
                ];
            default:
                return [
                    {
                        label: 'Search Patients',
                        path: '/medical-records/search',
                        icon: <Search className="w-4 h-4" />,
                        color: 'bg-orange-600 hover:bg-orange-700'
                    }
                ];
        }
    };

    const roleActions = getRoleSpecificActions();

    if (loading && !recentRecords) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Medical Records System
                </h1>
                <div className="flex space-x-2">
                    {roleActions.slice(0, 2).map((action, index) => (
                        <Link key={index} to={action.path}>
                            <Button className={`${action.color} text-white`}>
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            All medical records in system
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeCases || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently under treatment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.resolvedToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Cases completed today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingReview || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Medical Records */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ClipboardList className="w-5 h-5 mr-2" />
                        Recent Medical Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-3 p-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error}
                                <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
                                    <Loader2 className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : recentRecords && recentRecords.length > 0 ? (
                        <div className="space-y-4">
                            {recentRecords.map((record) => (
                                <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.patientName} ({record.patientId})
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {record.diagnosis}
                                                </p>
                                                {record.chiefComplaint && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Chief Complaint: {record.chiefComplaint}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {record.icd10Code && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {record.icd10Code}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {record.doctor}
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
                                            {new Date(record.lastUpdated).toLocaleDateString()}
                                        </span>
                                        <Link to={`/medical-records/enhanced/${record._id}`}>
                                            <Button variant="outline" size="sm">
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
                            <p className="text-gray-500">No medical records found</p>
                            {userRole === 'Doctor' && (
                                <Link to="/medical-records/create">
                                    <Button className="mt-4">
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Create First Record
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role-specific Features */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Features for {userRole}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roleActions.map((action, index) => (
                            <Link key={index} to={action.path}>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="flex items-center p-4">
                                        <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                                            {action.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{action.label}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Feature for {userRole}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            {stats?.recentActivity && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Today's Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.recentActivity.created}
                                </div>
                                <p className="text-sm text-gray-600">Records Created</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.recentActivity.updated}
                                </div>
                                <p className="text-sm text-gray-600">Records Updated</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.recentActivity.reviewed}
                                </div>
                                <p className="text-sm text-gray-600">Records Reviewed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MedicalRecordsOverview;
