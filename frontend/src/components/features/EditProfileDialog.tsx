// src/components/features/EditProfileDialog.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { patientProfileApi, UpdateProfileRequest } from '@/api/patientProfile';
import type { PatientProfileData } from '@/api/types';
import { useState } from 'react';

// Định nghĩa schema validation bằng Zod
const profileFormSchema = z.object({
    bloodType: z.string().optional(),
    allergies: z.string().optional(), // Nhận vào dạng chuỗi, sẽ xử lý sau
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
    patientId: string;
    profile: PatientProfileData | null; // Dữ liệu profile hiện tại
    children: React.ReactNode; // Nút trigger mở dialog
}

export function EditProfileDialog({ patientId, profile, children }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const defaultValues: Partial<ProfileFormValues> = {
        bloodType: profile?.bloodType || '',
        allergies: profile?.allergies?.join(', ') || '', // Chuyển array thành chuỗi
    };

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
    });

    const mutation = useMutation({
        mutationFn: patientProfileApi.createOrUpdateProfile,
        onSuccess: () => {
            toast({ title: "Success", description: "Patient profile has been updated." });
            // Vô hiệu hóa cache và fetch lại dữ liệu cho trang profile
            queryClient.invalidateQueries({ queryKey: ['profile', patientId] });
            setOpen(false); // Đóng dialog sau khi thành công
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    function onSubmit(data: ProfileFormValues) {
        const requestData: UpdateProfileRequest = {
            patientId,
            bloodType: data.bloodType,
            // Chuyển chuỗi allergies thành array, loại bỏ khoảng trắng và phần tử rỗng
            allergies: data.allergies?.split(',').map(item => item.trim()).filter(Boolean),
        };
        mutation.mutate(requestData);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Patient Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to the patient's profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="bloodType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Blood Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., A+, O-" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="allergies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allergies</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Peanuts, Pollen,..." {...field} />
                                    </FormControl>
                                    <p className="text-sm text-muted-foreground">Separate allergies with a comma.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}