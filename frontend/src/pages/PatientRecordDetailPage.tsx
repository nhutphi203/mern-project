// Enhanced PatientRecordDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/api/api';
import { useCurrentUser } from '@/hooks/useAuth';
import { PrescriptionManagement } from '@/components/doctor/PrescriptionManagement';
import { MediaRecordManager } from '@/components/doctor/MediaRecordManager';
import { PatientHistoryTimeline } from '@/components/doctor/PatientHistoryTimeline';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2, User, FileText, ArrowLeft, Calendar, Phone,
    Mail, MapPin, CreditCard, Users, Activity, Upload,
    Clock, Edit3, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInYears } from 'date-fns';

// --- Enhanced Types ---
interface PatientData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female';
    dob: string;
    nic: string;
    address?: string;
    createdAt: string;
}

interface MedicalRecordData {
    _id: string;
    patientId: PatientData;
    doctorId: string;
    appointmentId: string;
    diagnosis: string;
    symptoms: string;
    treatmentPlan: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    version?: number;
}

interface AppointmentData {
    _id: string;
    appointment_date: string;
    status: string;
    department: string;
    hasVisited: boolean;
}

const medicalRecordSchema = z.object({
    diagnosis: z.string().min(1, 'Chẩn đoán là bắt buộc'),
    symptoms: z.string().min(1, 'Triệu chứng là bắt buộc'),
    treatmentPlan: z.string().min(1, 'Kế hoạch điều trị là bắt buộc'),
    notes: z.string().optional(),
});
interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}
type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

const PatientRecordDetailPage = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');
    const navigate = useNavigate();

    const { data: currentUserData } = useCurrentUser();
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecordData | null>(null);
    const [patientInfo, setPatientInfo] = useState<PatientData | null>(null);
    const [appointmentInfo, setAppointmentInfo] = useState<AppointmentData | null>(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const doctorInfo = {
        id: currentUserData?.user?._id || '',
        name: `${currentUserData?.user?.firstName} ${currentUserData?.user?.lastName}`
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<MedicalRecordFormValues>({
        resolver: zodResolver(medicalRecordSchema),
    });

    // Calculate patient age
    const getPatientAge = (dob: string) => {
        return differenceInYears(new Date(), new Date(dob));
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!patientId || !appointmentId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            try {
                // Fetch patient info with error handling
                try {
                    const patientResponse = await api.get(`/api/v1/users/${patientId}`);
                    if (patientResponse.data?.user) {
                        setPatientInfo(patientResponse.data.user);
                    }
                } catch (error) {
                    console.log("Patient info not available:", error);
                    toast.error("Could not load patient information");
                }

                // Fetch appointment info with error handling
                try {
                    const appointmentResponse = await api.get(`/api/v1/appointment/${appointmentId}`);
                    if (appointmentResponse.data?.appointment) {
                        setAppointmentInfo(appointmentResponse.data.appointment);
                    }
                } catch (error) {
                    console.log("Appointment info not available:", error);
                    // Don't show error toast for appointment - it's optional
                }

                // 🆕 ENHANCED: Use enhanced medical records API
                try {
                    const recordResponse = await api.get(`/api/v1/medical-records/enhanced/appointment/${appointmentId}`);
                    if (recordResponse.data?.success && recordResponse.data?.data) {
                        setMedicalRecord(recordResponse.data.data);
                        reset(recordResponse.data.data);
                    }
                } catch (recordError) {
                    const apiRecordError = recordError as ApiError;
                    if (apiRecordError.response?.status === 404) {
                        console.log("No medical record found. Ready to create new one.");
                        setIsEditing(true); // Auto enable editing for new records
                    } else {
                        console.error("Error fetching medical record:", recordError);
                    }
                }

                // 🆕 ENHANCED: Use enhanced medical records API for patient history  
                try {
                    const historyResponse = await api.get(`/api/v1/medical-records/enhanced/patient/${patientId}/history`);
                    if (historyResponse.data?.success && historyResponse.data?.data) {
                        setPatientHistory(historyResponse.data.data);
                    }
                } catch (error) {
                    console.log("Patient history not available:", error);
                    setPatientHistory([]); // Set empty array instead of keeping null
                }

            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Some data could not be loaded. You can still create medical records.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [patientId, appointmentId, reset]);

    const onSubmit = async (data: MedicalRecordFormValues) => {
        if (!appointmentId) {
            toast.error("Thiếu thông tin lịch hẹn!");
            return;
        }
        try {
            // 🆕 ENHANCED: Use enhanced medical records API endpoints
            const url = medicalRecord
                ? `/api/v1/medical-records/enhanced/${medicalRecord._id}`
                : '/api/v1/medical-records/enhanced';

            const method = medicalRecord ? 'put' : 'post';

            const response = await api[method](url, {
                ...data,
                patientId,
                doctorId: doctorInfo.id,
                appointmentId,
            });

            // 🆕 ENHANCED: Handle enhanced API response format
            if (response.data.success && response.data.data) {
                setMedicalRecord(response.data.data);
                setIsEditing(false);
                toast.success("Đã lưu hồ sơ bệnh án thành công!");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error saving medical record:", error);
            toast.error("Lỗi khi lưu hồ sơ bệnh án.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {/* Header with Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/doctor-dashboard')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
                <div className="h-6 border-l border-gray-300" />
                <h1 className="text-3xl font-bold text-gray-900">Patient Record</h1>
            </div>

            {/* Patient Info Card */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <User className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">
                                    {patientInfo?.firstName} {patientInfo?.lastName}
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {patientInfo?.gender}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {patientInfo?.dob ? `${getPatientAge(patientInfo.dob)} years old` : 'N/A'}
                                    </span>
                                    <Badge variant={appointmentInfo?.hasVisited ? 'default' : 'secondary'}>
                                        {appointmentInfo?.hasVisited ? 'Returning Patient' : 'New Patient'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {appointmentInfo && (
                            <Badge variant="outline" className="text-sm">
                                {format(new Date(appointmentInfo.appointment_date), 'MMM dd, yyyy - hh:mm a')}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Phone:</span>
                                <span>{patientInfo?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Email:</span>
                                <span>{patientInfo?.email || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">ID/NIC:</span>
                                <span>{patientInfo?.nic || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Department:</span>
                                <span>{appointmentInfo?.department || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                <span className="font-medium">Address:</span>
                                <span className="text-gray-600">{patientInfo?.address || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="medical-record">Medical Record</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="media">Media & Files</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Current Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {medicalRecord ? (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium text-sm text-gray-600">Last Diagnosis:</span>
                                            <p className="text-sm mt-1">{medicalRecord.diagnosis}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-gray-600">Treatment Plan:</span>
                                            <p className="text-sm mt-1">{medicalRecord.treatmentPlan}</p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Last updated: {format(new Date(medicalRecord.updatedAt), 'MMM dd, yyyy hh:mm a')}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No medical record available yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Visits:</span>
                                        <Badge variant="secondary">{patientHistory.length + (medicalRecord ? 1 : 0)}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Patient Since:</span>
                                        <span className="text-sm">
                                            {patientInfo?.createdAt ? format(new Date(patientInfo.createdAt), 'MMM yyyy') : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Medical Record Tab */}
                <TabsContent value="medical-record">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    <CardTitle>Medical Record</CardTitle>
                                </div>
                                {medicalRecord && !isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Symptoms</label>
                                        <Textarea
                                            {...register('symptoms')}
                                            placeholder="Patient reported symptoms..."
                                            className="min-h-[100px]"
                                        />
                                        {errors.symptoms && (
                                            <p className="text-red-500 text-sm mt-1">{errors.symptoms.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Diagnosis</label>
                                        <Textarea
                                            {...register('diagnosis')}
                                            placeholder="Medical diagnosis..."
                                            className="min-h-[100px]"
                                        />
                                        {errors.diagnosis && (
                                            <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Treatment Plan</label>
                                        <Textarea
                                            {...register('treatmentPlan')}
                                            placeholder="Recommended treatment and next steps..."
                                            className="min-h-[120px]"
                                        />
                                        {errors.treatmentPlan && (
                                            <p className="text-red-500 text-sm mt-1">{errors.treatmentPlan.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                        <Textarea
                                            {...register('notes')}
                                            placeholder="Any additional observations or notes..."
                                            className="min-h-[80px]"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Save Record
                                        </Button>
                                        {medicalRecord && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    reset(medicalRecord);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            ) : medicalRecord ? (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-2">Symptoms</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{medicalRecord.symptoms}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-2">Diagnosis</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{medicalRecord.diagnosis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-2">Treatment Plan</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{medicalRecord.treatmentPlan}</p>
                                    </div>
                                    {medicalRecord.notes && (
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-600 mb-2">Additional Notes</h4>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{medicalRecord.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <h3 className="font-medium mb-2">No Medical Record</h3>
                                    <p className="text-sm mb-4">Create a medical record to get started.</p>
                                    <Button onClick={() => setIsEditing(true)}>Create New Record</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions">
                    {medicalRecord ? (
                        <PrescriptionManagement
                            medicalRecordId={medicalRecord._id}
                            patientId={patientId!}
                            doctorInfo={doctorInfo}
                        />
                    ) : (
                        <Card className="text-center p-8">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="font-medium mb-2">Medical Record Required</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Create a medical record first to manage prescriptions.
                            </p>
                            <Button onClick={() => setActiveTab('medical-record')}>
                                Go to Medical Record
                            </Button>
                        </Card>
                    )}
                </TabsContent>

                {/* Media & Files Tab */}
                <TabsContent value="media">
                    {appointmentId ? (
                        <MediaRecordManager
                            appointmentId={appointmentId}
                            patientId={patientId}
                        />) : (
                        <Card className="text-center p-8">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="font-medium mb-2">Appointment Required</h3>
                            <p className="text-sm text-gray-500">
                                Media files are linked to specific appointments.
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <PatientHistoryTimeline
                        patientId={patientId!}
                        history={patientHistory}
                        currentRecord={medicalRecord}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PatientRecordDetailPage;