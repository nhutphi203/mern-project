import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Upload, File, Image, Video, Download, Trash2, Eye, Plus, X, FileText, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { mediaRecordApi } from '@/api/mediaRecords';
import { MediaRecord } from '@/api/types'; // [SỬA LỖI] Thay đổi đường dẫn import
import { useCurrentUser } from '@/hooks/useAuth'; // Giả sử bạn có hook này để lấy thông tin user

interface MediaRecordManagerProps {
    appointmentId: string;
    patientId: string;
}

const MediaRecordManager: React.FC<MediaRecordManagerProps> = ({ appointmentId, patientId }) => {
    const [mediaRecords, setMediaRecords] = useState<MediaRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data: currentUser } = useCurrentUser(); // Lấy thông tin bác sĩ đang đăng nhập

    useEffect(() => {
        if (appointmentId) {
            fetchMediaRecords();
        }
    }, [appointmentId]);

    const fetchMediaRecords = async () => {
        try {
            setIsLoading(true);
            const response = await mediaRecordApi.getForAppointment(appointmentId);
            setMediaRecords(response.mediaRecords);
        } catch (error) {
            console.error('Error fetching media records:', error);
            toast.error('Failed to load media records');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !currentUser?.user?._id) {
            toast.error("File or user information is missing.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('appointmentId', appointmentId);
        formData.append('patientId', patientId);
        formData.append('doctorId', currentUser.user._id);
        formData.append('description', description);

        try {
            setIsUploading(true);
            await mediaRecordApi.upload(formData);
            toast.success('File uploaded successfully');
            setShowUploadDialog(false);
            resetUploadForm();
            fetchMediaRecords();
        } catch (error) {
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (recordId: string) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await mediaRecordApi.delete(recordId);
            toast.success('File deleted successfully');
            fetchMediaRecords();
        } catch (error) {
            toast.error(error.message || 'Failed to delete file');
        }
    };

    const resetUploadForm = () => {
        setSelectedFile(null);
        setDescription('');
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-green-600" />;
        if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-600" />;
        if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />;
        return <File className="h-5 w-5 text-gray-600" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <File className="h-5 w-5" />
                        <CardTitle>Media & Documents</CardTitle>
                        <Badge variant="secondary">{mediaRecords.length} files</Badge>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Upload File
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Medical File</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select File</label>
                                    <Input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.mp4,.avi,.mov"
                                        onChange={handleFileSelect}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported: JPG, PNG, PDF, MP4, AVI, MOV (max 10MB)
                                    </p>
                                </div>

                                {selectedFile && (
                                    <div className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                                            <Button variant="ghost" size="sm" onClick={resetUploadForm}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Size: {formatFileSize(selectedFile.size)}
                                        </div>
                                        {previewUrl && (
                                            <div className="mt-3">
                                                <img src={previewUrl} alt="Preview" className="max-w-full h-32 object-contain rounded border" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of the file..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="flex-1">
                                        {isUploading ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
                                        ) : (
                                            <><Upload className="h-4 w-4 mr-2" /> Upload</>
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => { setShowUploadDialog(false); resetUploadForm(); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {mediaRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <File className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">No Files Uploaded</h3>
                        <p className="text-sm mb-4">Upload medical images, documents, or videos for this appointment.</p>
                        <Button onClick={() => setShowUploadDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload First File
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mediaRecords.map((record) => (
                            <div key={record._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="flex-shrink-0 mt-1">{getFileIcon(record.fileType)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{record.fileName}</p>
                                            <p className="text-sm text-gray-600 my-1">{record.description || 'No description'}</p>
                                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                <span>{formatFileSize(record.fileSize)}</span>
                                                <span>Uploaded by {record.doctorId.firstName}</span>
                                                <span>{format(new Date(record.createdAt), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-4">
                                        <Button variant="ghost" size="icon" onClick={() => window.open(record.fileUrl, '_blank')} title="View file">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(record._id)} className="text-red-600 hover:text-red-700" title="Delete file">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export { MediaRecordManager };
