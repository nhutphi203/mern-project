// src/pages/PatientProfile.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Droplet, ShieldAlert, Stethoscope, PhoneCall } from 'lucide-react';
import Layout from '@/components/layout/Layout'; // <-- 1. Import Layout chung
import { patientProfileApi } from '@/api/patientProfile';
import { useCurrentUser } from '@/hooks/useAuth';
import { EditProfileDialog } from '@/components/features/EditProfileDialog';

const PatientProfilePage = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { data: currentUserData } = useCurrentUser();
    const { data: profileData, isLoading, error } = useQuery({
        queryKey: ['profile', patientId],
        queryFn: () => patientProfileApi.getProfile(patientId!),
        enabled: !!patientId,
    });

    const profile = profileData?.profile;

    if (error) return <div className="text-red-500 text-center py-10">{error.message}</div>;
    if (isLoading) return <div className="text-center py-10">Loading patient profile...</div>;

    const canEdit = currentUserData?.user?.role === 'Admin';

    return (
        // 2. Bọc toàn bộ trang bằng component Layout
        <Layout>
            {/* 3. Bỏ thẻ <main>, thay bằng div vì Layout đã có <main> với padding đúng */}
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        Patient Profile: {profile?.patient?.firstName} {profile?.patient?.lastName}
                    </h1>
                    {canEdit && (
                        <EditProfileDialog patientId={patientId!} profile={profile || null}>
                            <Button>{profile ? 'Edit Profile' : 'Create Profile'}</Button>
                        </EditProfileDialog>
                    )}
                </div>

                {!profile ? (
                    <div className="text-center py-10">
                        <p>This patient does not have a profile yet.</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* CỘT BÊN TRÁI: THÔNG TIN CƠ BẢN VÀ KHẨN CẤP */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><User /> Basic Information</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Droplet className="h-5 w-5 text-muted-foreground" />
                                        <span>Blood Type: <strong>{profile.bloodType || 'N/A'}</strong></span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div>
                                            <p>Allergies:</p>
                                            {profile.allergies?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {profile.allergies.map(allergy => <Badge key={allergy} variant="destructive">{allergy}</Badge>)}
                                                </div>
                                            ) : <p className="text-sm text-muted-foreground">None reported.</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><PhoneCall /> Emergency Contact</CardTitle></CardHeader>
                                <CardContent>
                                    {profile.emergencyContact ? (
                                        <div className="space-y-2">
                                            <p><strong>Name:</strong> {profile.emergencyContact.name}</p>
                                            <p><strong>Relationship:</strong> {profile.emergencyContact.relationship}</p>
                                            <p><strong>Phone:</strong> {profile.emergencyContact.phone}</p>
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No emergency contact provided.</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* CỘT BÊN PHẢI: TIỀN SỬ BỆNH ÁN CHI TIẾT */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Stethoscope /> Medical History</CardTitle>
                                    <CardDescription>Record of past diagnoses and conditions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {profile.medicalHistory?.length > 0 ? (
                                        <div className="space-y-4">
                                            {profile.medicalHistory.map((record) => (
                                                <div key={record._id} className="border-l-4 border-primary pl-4 py-2 bg-muted/20 rounded">
                                                    <p className="font-semibold">{record.condition}</p>
                                                    <p className="text-sm">{record.treatment}</p>
                                                    <p className="text-sm text-muted-foreground italic">"{record.notes}"</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Diagnosed on: {record.diagnosedDate ? new Date(record.diagnosedDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No medical history recorded.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PatientProfilePage;
