// frontend/src/components/doctor/PatientHistoryTimeline.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    User,
    FileText,
    Pill,
    ChevronDown,
    ChevronUp,
    Activity,
    Stethoscope,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Doctor {
    _id: string;
    firstName: string;
    lastName: string;
    doctorDepartment?: string;
}

interface HistoryRecord {
    _id: string;
    appointmentId: string;
    doctorId: Doctor;
    diagnosis: string;
    symptoms: string;
    treatmentPlan: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    prescriptions?: Array<{
        _id: string;
        medications: Array<{
            name: string;
            dosage: string;
        }>;
        status: 'Active' | 'Cancelled' | 'Completed';
    }>;
}

interface CurrentRecord {
    _id: string;
    diagnosis: string;
    symptoms: string;
    treatmentPlan: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface PatientHistoryTimelineProps {
    patientId: string;
    history: HistoryRecord[];
    currentRecord?: CurrentRecord | null;
}

const PatientHistoryTimeline: React.FC<PatientHistoryTimelineProps> = ({
    patientId,
    history,
    currentRecord
}) => {
    const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

    const toggleExpanded = (recordId: string) => {
        const newExpanded = new Set(expandedRecords);
        if (newExpanded.has(recordId)) {
            newExpanded.delete(recordId);
        } else {
            newExpanded.add(recordId);
        }
        setExpandedRecords(newExpanded);
    };

    const getStatusIcon = (isCurrentRecord: boolean, status?: string) => {
        if (isCurrentRecord) {
            return <Activity className="h-4 w-4 text-blue-600" />;
        }
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    };

    const getStatusBadge = (isCurrentRecord: boolean) => {
        if (isCurrentRecord) {
            return <Badge className="bg-blue-100 text-blue-800">Current</Badge>;
        }
        return <Badge variant="secondary">Completed</Badge>;
    };

    // Combine current record with history for timeline
    const timelineData = React.useMemo(() => {
        const timeline = [...history];

        if (currentRecord) {
            timeline.unshift({
                ...currentRecord,
                appointmentId: 'current',
                doctorId: {
                    _id: 'current-doctor',
                    firstName: 'Current',
                    lastName: 'Session'
                },
                prescriptions: []
            } as HistoryRecord);
        }

        return timeline.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [history, currentRecord]);

    if (timelineData.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Medical History</h3>
                    <p className="text-sm text-gray-500">
                        This patient's medical history will appear here as records are created.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>Medical History Timeline</CardTitle>
                    <Badge variant="secondary">{timelineData.length} records</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                        {timelineData.map((record, index) => {
                            const isCurrentRecord = record.appointmentId === 'current';
                            const isExpanded = expandedRecords.has(record._id);

                            return (
                                <div key={record._id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute left-6 w-4 h-4 bg-white border-2 border-blue-500 rounded-full z-10">
                                        <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="ml-16">
                                        <Card className={`${isCurrentRecord ? 'border-blue-200 bg-blue-50' : ''}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(isCurrentRecord)}
                                                            <span className="font-medium text-sm">
                                                                {format(new Date(record.createdAt), 'MMMM dd, yyyy')}
                                                            </span>
                                                            {getStatusBadge(isCurrentRecord)}
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                Dr. {record.doctorId.firstName} {record.doctorId.lastName}
                                                            </span>
                                                            {record.doctorId.doctorDepartment && (
                                                                <span className="flex items-center gap-1">
                                                                    <Stethoscope className="h-3 w-3" />
                                                                    {record.doctorId.doctorDepartment}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Collapsible
                                                        open={isExpanded}
                                                        onOpenChange={() => toggleExpanded(record._id)}
                                                    >
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                {isExpanded ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </Collapsible>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                {/* Always visible summary */}
                                                <div className="space-y-2 mb-4">
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                            Primary Diagnosis
                                                        </span>
                                                        <p className="text-sm text-gray-900 mt-1">
                                                            {record.diagnosis || 'No diagnosis recorded'}
                                                        </p>
                                                    </div>

                                                    {record.prescriptions && record.prescriptions.length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <Pill className="h-4 w-4 text-green-600" />
                                                            <span className="text-xs text-gray-600">
                                                                {record.prescriptions.length} prescription(s) issued
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expandable details */}
                                                <Collapsible
                                                    open={isExpanded}
                                                    onOpenChange={() => toggleExpanded(record._id)}
                                                >
                                                    <CollapsibleContent className="space-y-4">
                                                        <div className="border-t pt-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                                        Symptoms
                                                                    </span>
                                                                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                                                                        {record.symptoms || 'No symptoms recorded'}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                                        Treatment Plan
                                                                    </span>
                                                                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                                                                        {record.treatmentPlan || 'No treatment plan recorded'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {record.notes && (
                                                                <div className="mt-4">
                                                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                                        Additional Notes
                                                                    </span>
                                                                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">
                                                                        {record.notes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {record.prescriptions && record.prescriptions.length > 0 && (
                                                                <div className="mt-4">
                                                                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                                        Prescriptions
                                                                    </span>
                                                                    <div className="space-y-2 mt-2">
                                                                        {record.prescriptions.map((prescription, idx) => (
                                                                            <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-sm font-medium">
                                                                                        Prescription #{idx + 1}
                                                                                    </span>
                                                                                    <Badge
                                                                                        variant={
                                                                                            prescription.status === 'Active' ? 'default' :
                                                                                                prescription.status === 'Completed' ? 'secondary' :
                                                                                                    'destructive'
                                                                                        }
                                                                                        className="text-xs"
                                                                                    >
                                                                                        {prescription.status}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    {prescription.medications.map((med, medIdx) => (
                                                                                        <div key={medIdx} className="text-xs text-gray-700">
                                                                                            • {med.name} - {med.dosage}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {record.updatedAt !== record.createdAt && (
                                                                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Last updated: {format(new Date(record.updatedAt), 'MMM dd, yyyy hh:mm a')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export { PatientHistoryTimeline };