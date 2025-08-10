import React from 'react';
import { usePatientPrescriptions } from '@/hooks/usePrescriptions'; // <--- Sửa ở đây
import { useCurrentUser } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Pill, Calendar, User, Loader2 } from 'lucide-react';

const MedicalRecords = () => {
    const { data: currentUser } = useCurrentUser();
    const { data: prescriptionData, isLoading, isError } = usePatientPrescriptions(currentUser?.user._id);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Loading medical records...</p>
                </div>
            );
        }

        if (isError || !prescriptionData || prescriptionData.prescriptions.length === 0) {
            return (
                <div className="text-center py-10 mt-8 border border-dashed rounded-lg">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Prescriptions Found</h3>
                    <p className="mt-1 text-sm text-gray-500">You do not have any prescriptions in your records yet.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {prescriptionData.prescriptions.map((prescription) => (
                    <Card key={prescription._id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Pill className="h-5 w-5 text-primary" />
                                        <span>Prescription Details</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Issued on {new Date(prescription.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <Badge variant={prescription.status === 'Active' ? 'default' : 'secondary'}>
                                    {prescription.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">Medications:</h4>
                                <ul className="space-y-2">
                                    {prescription.medications.map((med, index) => (
                                        <li key={index} className="p-2 bg-muted rounded-md text-sm">
                                            <strong>{med.name}</strong> ({med.dosage}) - {med.frequency} for {med.duration}.
                                            {med.notes && <p className="text-xs text-muted-foreground mt-1">Note: {med.notes}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between items-center border-t pt-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Department: {prescription.doctorId.doctorDepartment}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        // Bố cục container chính, sẽ được đặt bên trong <main> của Layout.tsx
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-extrabold text-center mb-10">My Medical Records</h1>
            {renderContent()}
        </div>
    );
};

export default MedicalRecords;
