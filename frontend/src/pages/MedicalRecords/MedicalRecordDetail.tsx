import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ArrowLeft,
    FileText,
    User,
    Calendar,
    Stethoscope,
    Pill,
    Activity,
    AlertCircle,
    Loader2,
    Edit,
    Save,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useAuth';
import { MedicalRecordsAPI, type MedicalRecord } from '@/api/medicalRecords';
import DiagnosisTab from '@/components/MedicalRecords/DiagnosisTab';

const MedicalRecordDetail: React.FC = () => {
    const { recordId } = useParams<{ recordId: string }>();
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();

    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);

    // Load medical record
    const loadRecord = useCallback(async () => {
        if (!recordId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await MedicalRecordsAPI.getRecordById(recordId);
            if (response.success) {
                setRecord(response.data);
            } else {
                setError('Failed to load medical record');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading medical record');
            console.error('Error loading medical record:', err);
        } finally {
            setLoading(false);
        }
    }, [recordId]);

    useEffect(() => {
        loadRecord();
    }, [loadRecord]);

    // Get status badge color
    const getStatusBadge = (status: string) => {
        const variants = {
            'Active': 'bg-green-100 text-green-800 border-green-200',
            'Completed': 'bg-blue-100 text-blue-800 border-blue-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Under Treatment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Resolved': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return variants[status] || variants['Active'];
    };

    // Get priority badge color
    const getPriorityBadge = (priority: string) => {
        const variants = {
            'Routine': 'bg-gray-100 text-gray-800 border-gray-200',
            'Urgent': 'bg-orange-100 text-orange-800 border-orange-200',
            'Emergent': 'bg-red-100 text-red-800 border-red-200'
        };
        return variants[priority] || variants['Routine'];
    };

    // Check permissions
    const canEdit = () => {
        if (!currentUser || !record) return false;

        const userRole = currentUser.user.role;
        const userId = currentUser.user._id;

        // Admin can edit everything
        if (userRole === 'Admin') return true;

        // Doctor can edit their own records
        if (userRole === 'Doctor') {
            const doctorId = typeof record.doctorId === 'string' ? record.doctorId : record.doctorId._id;
            return doctorId === userId;
        }

        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading medical record...</p>
                </div>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error || 'Medical record not found'}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    const patientName = typeof record.patientId === 'string'
        ? 'Patient'
        : `${record.patientId.firstName} ${record.patientId.lastName}`;

    const doctorName = typeof record.doctorId === 'string'
        ? 'Doctor'
        : `Dr. ${record.doctorId.firstName} ${record.doctorId.lastName}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Medical Record</h1>
                            <p className="text-gray-600">
                                {patientName} • {new Date(record.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {canEdit() && (
                        <div className="flex items-center space-x-2">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Record
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Patient & Record Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Patient Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium">{patientName}</p>
                                {typeof record.patientId !== 'string' && (
                                    <>
                                        <p className="text-sm text-gray-600">{record.patientId.email}</p>
                                        {record.patientId.phone && (
                                            <p className="text-sm text-gray-600">{record.patientId.phone}</p>
                                        )}
                                        {record.patientId.dateOfBirth && (
                                            <p className="text-sm text-gray-600">
                                                Born: {new Date(record.patientId.dateOfBirth).toLocaleDateString()}
                                            </p>
                                        )}
                                        {record.patientId.gender && (
                                            <p className="text-sm text-gray-600">
                                                Gender: {record.patientId.gender}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Doctor Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Stethoscope className="w-5 h-5 mr-2" />
                                Attending Physician
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium">{doctorName}</p>
                                {typeof record.doctorId !== 'string' && (
                                    <>
                                        {record.doctorId.specialization && (
                                            <p className="text-sm text-gray-600">{record.doctorId.specialization}</p>
                                        )}
                                        {record.doctorId.licenseNumber && (
                                            <p className="text-sm text-gray-600">
                                                License: {record.doctorId.licenseNumber}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Record Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                Record Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status:</span>
                                    <Badge className={getStatusBadge(record.status)}>
                                        {record.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Priority:</span>
                                    <Badge className={getPriorityBadge(record.priority)}>
                                        {record.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Created:</span>
                                    <span className="text-sm">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Updated:</span>
                                    <span className="text-sm">
                                        {new Date(record.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Card>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview" className="flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="diagnosis" className="flex items-center">
                                    <Stethoscope className="w-4 h-4 mr-2" />
                                    Diagnoses
                                </TabsTrigger>
                                <TabsTrigger value="treatment" className="flex items-center">
                                    <Pill className="w-4 h-4 mr-2" />
                                    Treatment
                                </TabsTrigger>
                                <TabsTrigger value="timeline" className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Timeline
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent>
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Chief Complaint */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Chief Complaint</h3>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                            {record.chiefComplaint || 'No chief complaint recorded'}
                                        </p>
                                    </div>

                                    {/* History of Present Illness */}
                                    <div>
                                        <h3 className="font-semibold mb-2">History of Present Illness</h3>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                            {record.historyOfPresentIllness || 'No history recorded'}
                                        </p>
                                    </div>

                                    {/* Assessment */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Assessment</h3>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                            {record.assessment || 'No assessment recorded'}
                                        </p>
                                    </div>

                                    {/* Vital Signs */}
                                    {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Vital Signs</h3>
                                            <div className="bg-gray-50 p-3 rounded-md space-y-1">
                                                {record.vitalSigns.bloodPressure && (
                                                    <p><span className="font-medium">BP:</span> {record.vitalSigns.bloodPressure}</p>
                                                )}
                                                {record.vitalSigns.heartRate && (
                                                    <p><span className="font-medium">HR:</span> {record.vitalSigns.heartRate} bpm</p>
                                                )}
                                                {record.vitalSigns.temperature && (
                                                    <p><span className="font-medium">Temp:</span> {record.vitalSigns.temperature}°C</p>
                                                )}
                                                {record.vitalSigns.respiratoryRate && (
                                                    <p><span className="font-medium">RR:</span> {record.vitalSigns.respiratoryRate}/min</p>
                                                )}
                                                {record.vitalSigns.oxygenSaturation && (
                                                    <p><span className="font-medium">O2 Sat:</span> {record.vitalSigns.oxygenSaturation}%</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Allergies & Medications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {record.allergies && record.allergies.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Allergies</h3>
                                            <div className="space-y-1">
                                                {record.allergies.map((allergy, index) => (
                                                    <Badge key={index} variant="destructive" className="mr-2">
                                                        {allergy}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {record.medications && record.medications.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Current Medications</h3>
                                            <div className="space-y-1">
                                                {record.medications.map((medication, index) => (
                                                    <Badge key={index} variant="secondary" className="mr-2">
                                                        {medication}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Diagnosis Tab */}
                            <TabsContent value="diagnosis">
                                <DiagnosisTab
                                    medicalRecordId={record._id}
                                    patientId={typeof record.patientId === 'string' ? record.patientId : record.patientId._id}
                                    isReadOnly={!canEdit()}
                                    userRole={currentUser?.user.role}
                                />
                            </TabsContent>

                            {/* Treatment Tab */}
                            <TabsContent value="treatment">
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Plan</h3>
                                        <p className="text-gray-500">
                                            Treatment planning and medication management will be available here.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Timeline Tab */}
                            <TabsContent value="timeline">
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Medical Timeline</h3>
                                        <p className="text-gray-500">
                                            Patient's medical history timeline will be displayed here.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default MedicalRecordDetail;
