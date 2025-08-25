import React, { useState, useEffect } from 'react';
import { DiagnosisAPI, type Diagnosis, type ICD10Code, type CreateDiagnosisRequest } from '../../api/medicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Calendar, AlertCircle, CheckCircle2, Clock, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosisTabProps {
    medicalRecordId: string;
    patientId: string;
    isReadOnly?: boolean;
    userRole?: string;
}

const DiagnosisTab: React.FC<DiagnosisTabProps> = ({
    medicalRecordId,
    patientId,
    isReadOnly = false,
    userRole = 'Doctor'
}) => {
    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [icd10Results, setIcd10Results] = useState<ICD10Code[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState<CreateDiagnosisRequest>({
        icd10Code: '',
        type: 'Primary',
        severity: 'Moderate',
        status: 'Active',
        confidence: 'Probable'
    });

    // Load diagnoses for medical record
    const loadDiagnoses = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await DiagnosisAPI.getDiagnosesByRecord(medicalRecordId);
            if (response.success) {
                setDiagnoses(response.data);
            }
        } catch (error) {
            toast.error('Failed to load diagnoses');
            console.error('Error loading diagnoses:', error);
        } finally {
            setLoading(false);
        }
    }, [medicalRecordId]);

    // Search ICD-10 codes
    const searchICD10 = async (query: string) => {
        if (query.length < 2) {
            setIcd10Results([]);
            return;
        }

        try {
            const response = await DiagnosisAPI.searchICD10(query, 10);
            if (response.success) {
                setIcd10Results(response.data);
            }
        } catch (error) {
            console.error('Error searching ICD-10:', error);
        }
    };

    // Add new diagnosis
    const addDiagnosis = async () => {
        if (!formData.icd10Code) {
            toast.error('Please select an ICD-10 code');
            return;
        }

        try {
            const response = await DiagnosisAPI.addDiagnosis(medicalRecordId, formData);
            if (response.success) {
                toast.success('Diagnosis added successfully');
                setShowAddDialog(false);
                setFormData({
                    icd10Code: '',
                    type: 'Primary',
                    severity: 'Moderate',
                    status: 'Active',
                    confidence: 'Probable'
                });
                setSearchTerm('');
                setIcd10Results([]);
                loadDiagnoses(); // Refresh list
            }
        } catch (error) {
            toast.error('Failed to add diagnosis');
            console.error('Error adding diagnosis:', error);
        }
    };

    // Update diagnosis status
    const updateDiagnosisStatus = async (diagnosisId: string, status: string) => {
        try {
            const response = await DiagnosisAPI.updateDiagnosis(diagnosisId, {
                status: status as 'Active' | 'Resolved' | 'Chronic' | 'In Remission'
            });
            if (response.success) {
                toast.success('Diagnosis updated successfully');
                loadDiagnoses();
            }
        } catch (error) {
            toast.error('Failed to update diagnosis');
            console.error('Error updating diagnosis:', error);
        }
    };

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        const variants = {
            'Active': { variant: 'default' as const, icon: <AlertCircle className="w-3 h-3" />, color: 'text-red-600' },
            'Resolved': { variant: 'secondary' as const, icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-green-600' },
            'Chronic': { variant: 'outline' as const, icon: <Clock className="w-3 h-3" />, color: 'text-orange-600' },
            'In Remission': { variant: 'secondary' as const, icon: <CheckCircle2 className="w-3 h-3" />, color: 'text-blue-600' }
        };
        return variants[status] || variants['Active'];
    };

    // Get severity color
    const getSeverityColor = (severity: string) => {
        const colors = {
            'Mild': 'text-green-600 bg-green-50 border-green-200',
            'Moderate': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'Severe': 'text-orange-600 bg-orange-50 border-orange-200',
            'Critical': 'text-red-600 bg-red-50 border-red-200'
        };
        return colors[severity] || colors['Moderate'];
    };

    // Get type color
    const getTypeColor = (type: string) => {
        const colors = {
            'Primary': 'text-blue-700 bg-blue-50 border-blue-200',
            'Secondary': 'text-purple-700 bg-purple-50 border-purple-200',
            'Differential': 'text-orange-700 bg-orange-50 border-orange-200',
            'Rule Out': 'text-gray-700 bg-gray-50 border-gray-200',
            'History': 'text-green-700 bg-green-50 border-green-200'
        };
        return colors[type] || colors['Primary'];
    };

    useEffect(() => {
        loadDiagnoses();
    }, [loadDiagnoses]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchICD10(searchTerm);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading diagnoses...</span>
            </div>
        );
    }

    const canEdit = userRole === 'Doctor' && !isReadOnly;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Diagnoses ({diagnoses.length})
                </h3>
                {canEdit && (
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Diagnosis
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Diagnosis</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {/* ICD-10 Search */}
                                <div className="space-y-2">
                                    <Label htmlFor="icd10-search">Search ICD-10 Codes</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="icd10-search"
                                            placeholder="Search by code or description (e.g., diabetes, I25.10)..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {icd10Results.length > 0 && (
                                        <div className="border rounded-md max-h-40 overflow-y-auto">
                                            {icd10Results.map((code) => (
                                                <div
                                                    key={code.code}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            icd10Code: code.code
                                                        }));
                                                        setSearchTerm(`${code.code} - ${code.shortDescription}`);
                                                        setIcd10Results([]);
                                                    }}
                                                >
                                                    <div className="font-medium">{code.code}</div>
                                                    <div className="text-sm text-gray-600">{code.shortDescription}</div>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {code.category}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Diagnosis Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CreateDiagnosisRequest['type'] }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Primary">Primary</SelectItem>
                                                <SelectItem value="Secondary">Secondary</SelectItem>
                                                <SelectItem value="Differential">Differential</SelectItem>
                                                <SelectItem value="Rule Out">Rule Out</SelectItem>
                                                <SelectItem value="History">History</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="severity">Severity</Label>
                                        <Select
                                            value={formData.severity}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as CreateDiagnosisRequest['severity'] }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                                <SelectItem value="Critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confidence">Confidence</Label>
                                        <Select
                                            value={formData.confidence}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, confidence: value as CreateDiagnosisRequest['confidence'] }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Probable">Probable</SelectItem>
                                                <SelectItem value="Possible">Possible</SelectItem>
                                                <SelectItem value="Suspected">Suspected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="onset-date">Onset Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.onsetDate || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, onsetDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="custom-description">Custom Description (Optional)</Label>
                                    <Input
                                        placeholder="Add any specific notes about this diagnosis..."
                                        value={formData.customDescription || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clinical-notes">Clinical Notes</Label>
                                    <Textarea
                                        placeholder="Additional clinical context, symptoms, examination findings..."
                                        value={formData.clinicalNotes || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={addDiagnosis} disabled={!formData.icd10Code}>
                                        Add Diagnosis
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Diagnoses List */}
            <div className="space-y-4">
                {diagnoses.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Stethoscope className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No diagnoses recorded yet</p>
                            {canEdit && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Click "Add Diagnosis" to record the first diagnosis
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    diagnoses.map((diagnosis) => {
                        const statusBadge = getStatusBadge(diagnosis.status);
                        return (
                            <Card key={diagnosis._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getTypeColor(diagnosis.type)}>
                                                    {diagnosis.type}
                                                </Badge>
                                                <Badge className={getSeverityColor(diagnosis.severity)}>
                                                    {diagnosis.severity}
                                                </Badge>
                                                <Badge variant={statusBadge.variant} className={statusBadge.color}>
                                                    {statusBadge.icon}
                                                    <span className="ml-1">{diagnosis.status}</span>
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg">{diagnosis.icd10Code}</CardTitle>
                                            <p className="text-gray-600">{diagnosis.icd10Description}</p>
                                            {diagnosis.customDescription && (
                                                <p className="text-sm font-medium text-blue-600">
                                                    {diagnosis.customDescription}
                                                </p>
                                            )}
                                        </div>
                                        {canEdit && diagnosis.status === 'Active' && (
                                            <Select
                                                value={diagnosis.status}
                                                onValueChange={(value) => updateDiagnosisStatus(diagnosis._id, value)}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                                    <SelectItem value="Chronic">Chronic</SelectItem>
                                                    <SelectItem value="In Remission">In Remission</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Confidence:</span>
                                            <span className="ml-2">{diagnosis.confidence}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Diagnosed:</span>
                                            <span className="ml-2">
                                                {new Date(diagnosis.diagnosedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {diagnosis.onsetDate && (
                                            <div>
                                                <span className="font-medium">Onset:</span>
                                                <span className="ml-2">
                                                    {new Date(diagnosis.onsetDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Doctor:</span>
                                            <span className="ml-2">
                                                Dr. {diagnosis.doctorId.firstName} {diagnosis.doctorId.lastName}
                                            </span>
                                        </div>
                                    </div>
                                    {diagnosis.clinicalNotes && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm font-medium mb-1">Clinical Notes:</p>
                                            <p className="text-sm text-gray-600">{diagnosis.clinicalNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DiagnosisTab;
