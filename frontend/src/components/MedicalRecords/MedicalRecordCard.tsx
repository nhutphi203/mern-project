import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MedicalRecord } from '@/api/medicalRecords';

interface MedicalRecordCardProps {
    record: MedicalRecord;
    showPatientInfo?: boolean;
    showActions?: boolean;
    userRole?: string;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
    record,
    showPatientInfo = true,
    showActions = true,
    userRole
}) => {
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

    const patientName = typeof record.patientId === 'string'
        ? 'Patient'
        : `${record.patientId.firstName} ${record.patientId.lastName}`;

    const doctorName = typeof record.doctorId === 'string'
        ? 'Doctor'
        : `Dr. ${record.doctorId.firstName} ${record.doctorId.lastName}`;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                        <h3 className="font-semibold text-lg">
                            Medical Record
                        </h3>
                        <p className="text-sm text-gray-600">
                            {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Badge className={getStatusBadge(record.status)}>
                        {record.status}
                    </Badge>
                    <Badge className={getPriorityBadge(record.priority)}>
                        {record.priority}
                    </Badge>
                </div>
            </div>

            {showPatientInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Patient</label>
                        <p className="text-gray-900">{patientName}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Doctor</label>
                        <p className="text-gray-900">{doctorName}</p>
                    </div>
                </div>
            )}

            <div className="space-y-2 mb-4">
                {record.chiefComplaint && (
                    <div>
                        <label className="text-sm font-medium text-gray-700">Chief Complaint</label>
                        <p className="text-gray-900 text-sm">
                            {record.chiefComplaint.length > 100
                                ? `${record.chiefComplaint.substring(0, 100)}...`
                                : record.chiefComplaint}
                        </p>
                    </div>
                )}

                {record.assessment && (
                    <div>
                        <label className="text-sm font-medium text-gray-700">Assessment</label>
                        <p className="text-gray-900 text-sm">
                            {record.assessment.length > 100
                                ? `${record.assessment.substring(0, 100)}...`
                                : record.assessment}
                        </p>
                    </div>
                )}
            </div>

            {/* Vital Signs */}
            {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 && (
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Vital Signs</label>
                    <div className="flex flex-wrap gap-2">
                        {record.vitalSigns.bloodPressure && (
                            <Badge variant="outline" className="text-xs">
                                BP: {record.vitalSigns.bloodPressure}
                            </Badge>
                        )}
                        {record.vitalSigns.heartRate && (
                            <Badge variant="outline" className="text-xs">
                                HR: {record.vitalSigns.heartRate} bpm
                            </Badge>
                        )}
                        {record.vitalSigns.temperature && (
                            <Badge variant="outline" className="text-xs">
                                Temp: {record.vitalSigns.temperature}°C
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {showActions && (
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Link to={`/medical-records/${record._id}`}>
                        <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </Link>

                    {(userRole === 'Admin' || userRole === 'Doctor') && (
                        <Link to={`/medical-records/${record._id}?edit=true`}>
                            <Button size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Record
                            </Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicalRecordCard;
