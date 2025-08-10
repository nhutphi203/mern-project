import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Trash2, FileSignature, X, Loader2, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/api/api'; // FIX: Sửa lại thành default import
import { toast } from 'sonner';

// --- Type Definitions for Data Structures ---
// Định nghĩa kiểu cho một loại thuốc
interface MedicationData {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
}

// Định nghĩa kiểu cho dữ liệu đơn thuốc nhận về từ API
interface PrescriptionData {
    _id: string;
    medicalRecordId: string;
    patientId: string;
    doctorId: string;
    medications: MedicationData[];
    digitalSignature: string;
    status: 'Active' | 'Cancelled' | 'Completed';
    createdAt: string;
    updatedAt: string;
}

// Định nghĩa kiểu cho lỗi API để tránh sử dụng 'any'
interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}


// --- Zod Schema for Form Validation ---
const medicationSchema = z.object({
    name: z.string().min(1, 'Tên thuốc là bắt buộc'),
    dosage: z.string().min(1, 'Liều lượng là bắt buộc'),
    frequency: z.string().min(1, 'Tần suất là bắt buộc'),
    duration: z.string().min(1, 'Thời gian là bắt buộc'),
    notes: z.string().optional(),
});

const prescriptionFormSchema = z.object({
    _id: z.string().optional(), // Dùng khi edit
    medicalRecordId: z.string().min(1),
    medications: z.array(medicationSchema).min(1, 'Phải có ít nhất một loại thuốc'),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

// --- Mock Digital Signature Function ---
const generateDigitalSignature = async (data: MedicationData[], doctorInfo: string): Promise<string> => {
    console.log("Signing data:", data);
    const dataString = JSON.stringify(data) + doctorInfo + new Date().toISOString();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    toast.success("Đã ký số thành công!");
    return `signature-${hashHex.substring(0, 32)}`;
};

// --- Component Props ---
interface PrescriptionManagementProps {
    medicalRecordId: string;
    patientId: string;
    doctorInfo: { id: string; name: string; };
}

// --- Main Component ---
export const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({ medicalRecordId, patientId, doctorInfo }) => {
    const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<PrescriptionFormValues | null>(null);
    const [digitalSignature, setDigitalSignature] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors, isValid },
    } = useForm<PrescriptionFormValues>({
        resolver: zodResolver(prescriptionFormSchema),
        defaultValues: {
            medicalRecordId: medicalRecordId,
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'medications',
    });

    useEffect(() => {
        const fetchPrescriptions = async () => {
            setIsLoading(true);
            try {
                const response = await api.get<{ prescriptions: PrescriptionData[] }>(`/prescriptions/record/${medicalRecordId}`);
                setPrescriptions(response.data.prescriptions);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách đơn thuốc.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrescriptions();
    }, [medicalRecordId]);

    const openModalForCreate = () => {
        reset({
            medicalRecordId: medicalRecordId,
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
        });
        setEditingPrescription(null);
        setDigitalSignature(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (prescription: PrescriptionData) => {
        const defaultValues = {
            _id: prescription._id,
            medicalRecordId: prescription.medicalRecordId,
            medications: prescription.medications.map(({ name, dosage, frequency, duration, notes }) => ({ name, dosage, frequency, duration, notes })),
        };
        reset(defaultValues);
        setEditingPrescription(defaultValues);
        setDigitalSignature(prescription.digitalSignature);
        setIsModalOpen(true);
    };

    const handleSign = async () => {
        const values = getValues();
        // FIX: Dùng type assertion vì chúng ta biết form đã valid tại thời điểm này
        const signature = await generateDigitalSignature(values.medications as MedicationData[], doctorInfo.name);
        setDigitalSignature(signature);
    };

    const onSubmit = async (data: PrescriptionFormValues) => {
        if (isSubmitting) return;

        if (!editingPrescription && !digitalSignature) {
            toast.warning("Vui lòng ký số trước khi lưu đơn thuốc.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingPrescription?._id) {
                const { _id, ...updateData } = data;
                const response = await api.put<{ prescription: PrescriptionData }>(`/prescriptions/${_id}`, updateData);
                setPrescriptions(prescriptions.map(p => p._id === _id ? response.data.prescription : p));
                toast.success('Cập nhật đơn thuốc thành công!');
            } else {
                const payload = { ...data, digitalSignature };
                const response = await api.post<{ prescription: PrescriptionData }>('/prescriptions', payload);
                setPrescriptions([response.data.prescription, ...prescriptions]);
                toast.success('Tạo mới đơn thuốc thành công!');
            }
            setIsModalOpen(false);
        } catch (error) {
            // FIX: Sử dụng kiểu ApiError thay cho 'any'
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.message || 'Đã có lỗi xảy ra.';
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn thuốc này?')) return;

        try {
            await api.delete(`/prescriptions/${id}`);
            setPrescriptions(prescriptions.filter(p => p._id !== id));
            toast.success('Đã xóa đơn thuốc.');
        } catch (error) {
            // FIX: Sử dụng kiểu ApiError thay cho 'any'
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.message || 'Lỗi khi xóa đơn thuốc.';
            toast.error(errorMessage);
        }
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Quản lý Đơn thuốc</CardTitle>
                    <CardDescription>Tạo, xem, và quản lý các đơn thuốc cho bệnh nhân.</CardDescription>
                </div>
                <Button onClick={openModalForCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tạo Đơn thuốc mới
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : prescriptions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Chưa có đơn thuốc nào.</p>
                ) : (
                    <div className="space-y-4">
                        {prescriptions.map(p => (
                            <div key={p._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">Đơn thuốc ngày: {new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                                        <Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openModalForEdit(p)}><Edit className="h-4 w-4 mr-1" /> Sửa</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4 mr-1" /> Xóa</Button>
                                    </div>
                                </div>
                                <ul className="mt-2 list-disc list-inside">
                                    {p.medications.map((med, index) => (
                                        <li key={index}>{med.name} ({med.dosage}) - {med.frequency}</li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500 mt-2 truncate">Chữ ký số: {p.digitalSignature}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{editingPrescription ? 'Chỉnh sửa Đơn thuốc' : 'Tạo Đơn thuốc mới'}</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}><X /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-10 gap-2 border-b pb-4">
                                        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Input placeholder="Tên thuốc" {...register(`medications.${index}.name`)} />
                                            <Input placeholder="Liều lượng (VD: 500mg)" {...register(`medications.${index}.dosage`)} />
                                            <Input placeholder="Tần suất (VD: 2 lần/ngày)" {...register(`medications.${index}.frequency`)} />
                                            <Input placeholder="Thời gian (VD: 7 ngày)" {...register(`medications.${index}.duration`)} />
                                            <Textarea className="sm:col-span-2" placeholder="Ghi chú (VD: Uống sau khi ăn)" {...register(`medications.${index}.notes`)} />
                                            {errors.medications?.[index] && <p className="text-red-500 text-xs sm:col-span-2">Vui lòng điền đủ thông tin thuốc.</p>}
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-end md:justify-center">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', notes: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm thuốc
                                </Button>

                                <div className="pt-4 border-t">
                                    {editingPrescription ? (
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                            <FileSignature className="h-5 w-5 text-gray-600" />
                                            <p className="text-sm text-gray-700 truncate">Chữ ký số đã được áp dụng: {digitalSignature}</p>
                                        </div>
                                    ) : digitalSignature ? (
                                        <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                                            <FileSignature className="h-5 w-5 text-green-700" />
                                            <p className="text-sm text-green-800 truncate">Đã ký số: {digitalSignature}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 bg-yellow-100 rounded">
                                            <AlertTriangle className="h-5 w-5 text-yellow-700" />
                                            <p className="text-sm text-yellow-800">Đơn thuốc chưa được ký số.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                                    {!editingPrescription && (
                                        <Button type="button" onClick={handleSign} disabled={!isValid || !!digitalSignature}>
                                            <FileSignature className="mr-2 h-4 w-4" /> Ký số
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={isSubmitting || (!editingPrescription && !digitalSignature)}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingPrescription ? 'Lưu thay đổi' : 'Lưu Đơn thuốc'}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            )}
        </Card>
    );
};
