// src/pages/NurseDashboard.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    HeartPulse,
    Thermometer,
    Activity,
    Users,
    AlertTriangle,
    Plus,
    Search,
    Calendar,
    Clock,
    Stethoscope,
    FileText,
    TrendingUp,
    Bell,
    Save,
    Eye,
    Edit3,
    ChevronRight
} from 'lucide-react';
import { useCurrentUser, useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { Navigate } from 'react-router-dom';

// Mock data for vital signs alerts
const vitalSignsAlerts = [
    {
        id: 1,
        patientName: "John Doe",
        patientId: "P001",
        type: "Blood Pressure",
        value: "180/110",
        severity: "Critical",
        time: "10:30 AM",
        room: "Room 201"
    },
    {
        id: 2,
        patientName: "Jane Smith",
        patientId: "P002",
        type: "Temperature",
        value: "39.5°C",
        severity: "High",
        time: "11:15 AM",
        room: "Room 105"
    },
    {
        id: 3,
        patientName: "Mike Johnson",
        patientId: "P003",
        type: "Heart Rate",
        value: "45 bpm",
        severity: "Low",
        time: "09:45 AM",
        room: "Room 302"
    }
];

// Mock data for patients assigned to nurse
const assignedPatients = [
    {
        id: "P001",
        name: "John Doe",
        room: "201",
        condition: "Post-surgery",
        lastVitals: "2 hours ago",
        status: "Stable",
        alerts: 1
    },
    {
        id: "P002",
        name: "Jane Smith",
        room: "105",
        condition: "Pneumonia",
        lastVitals: "1 hour ago",
        status: "Critical",
        alerts: 2
    },
    {
        id: "P003",
        name: "Mike Johnson",
        room: "302",
        condition: "Diabetes monitoring",
        lastVitals: "30 minutes ago",
        status: "Stable",
        alerts: 0
    },
    {
        id: "P004",
        name: "Sarah Wilson",
        room: "208",
        condition: "Recovery",
        lastVitals: "4 hours ago",
        status: "Good",
        alerts: 0
    }
];

// Vital Signs Form Component
const VitalSignsForm = ({ patientId, onClose }: { patientId?: string; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        patientId: patientId || '',
        bloodPressure: { systolic: '', diastolic: '' },
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        painScale: '',
        weight: '',
        height: '',
        glucose: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call API to save vital signs
        console.log('Saving vital signs:', formData);
        onClose();
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    Record Vital Signs
                </CardTitle>
                <CardDescription>
                    Enter patient's vital signs measurements
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Patient</Label>
                            <Select value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignedPatients.map(patient => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.name} - Room {patient.room}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Vital Signs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Blood Pressure */}
                        <div className="space-y-2">
                            <Label>Blood Pressure (mmHg)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Systolic"
                                    value={formData.bloodPressure.systolic}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        bloodPressure: { ...prev.bloodPressure, systolic: e.target.value }
                                    }))}
                                />
                                <span className="self-center">/</span>
                                <Input
                                    placeholder="Diastolic"
                                    value={formData.bloodPressure.diastolic}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Heart Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                            <Input
                                id="heartRate"
                                placeholder="72"
                                value={formData.heartRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                            />
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature (°C)</Label>
                            <Input
                                id="temperature"
                                placeholder="36.8"
                                value={formData.temperature}
                                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                            />
                        </div>

                        {/* Respiratory Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="respiratoryRate">Respiratory Rate (/min)</Label>
                            <Input
                                id="respiratoryRate"
                                placeholder="16"
                                value={formData.respiratoryRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                            />
                        </div>

                        {/* Oxygen Saturation */}
                        <div className="space-y-2">
                            <Label htmlFor="oxygenSaturation">O₂ Saturation (%)</Label>
                            <Input
                                id="oxygenSaturation"
                                placeholder="98"
                                value={formData.oxygenSaturation}
                                onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                            />
                        </div>

                        {/* Pain Scale */}
                        <div className="space-y-2">
                            <Label htmlFor="painScale">Pain Scale (0-10)</Label>
                            <Select value={formData.painScale} onValueChange={(value) => setFormData(prev => ({ ...prev, painScale: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pain level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i} - {i === 0 ? 'No pain' : i <= 3 ? 'Mild' : i <= 6 ? 'Moderate' : 'Severe'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                                id="weight"
                                placeholder="70"
                                value={formData.weight}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                            />
                        </div>

                        {/* Height */}
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                                id="height"
                                placeholder="170"
                                value={formData.height}
                                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                            />
                        </div>

                        {/* Glucose */}
                        <div className="space-y-2">
                            <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
                            <Input
                                id="glucose"
                                placeholder="100"
                                value={formData.glucose}
                                onChange={(e) => setFormData(prev => ({ ...prev, glucose: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional observations or notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4 mr-2" />
                            Save Vital Signs
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

const NurseDashboard = () => {
    const navigate = useNavigate();
    const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
    const { appointments, isLoading: appointmentsLoading } = useAppointments();
    const { logoutMutation, isLogouting } = useAuth();
    const [showVitalSignsForm, setShowVitalSignsForm] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');

    const nurse = currentUserData?.user;

    // Filter patients based on search
    const filteredPatients = useMemo(() => {
        return assignedPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Filter critical alerts
    const criticalAlerts = vitalSignsAlerts.filter(alert => alert.severity === 'Critical');

    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!nurse || nurse.role !== 'Nurse') {
        return <Navigate to="/login" replace />;
    }

    if (showVitalSignsForm) {
        return (
            <div className="p-6">
                <VitalSignsForm
                    patientId={selectedPatientId}
                    onClose={() => {
                        setShowVitalSignsForm(false);
                        setSelectedPatientId(undefined);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Nurse Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {nurse.firstName}! Manage patient care and vital signs.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowVitalSignsForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Record Vital Signs
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => logoutMutation()}
                        disabled={isLogouting}
                    >
                        {isLogouting ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Patients</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{assignedPatients.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Alerts</p>
                                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vitals Recorded Today</p>
                                <p className="text-2xl font-bold text-green-600">12</p>
                            </div>
                            <HeartPulse className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tasks</p>
                                <p className="text-2xl font-bold text-orange-600">5</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="patients" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="patients">My Patients</TabsTrigger>
                    <TabsTrigger value="alerts">Vital Signs Alerts</TabsTrigger>
                    <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
                </TabsList>

                {/* Patients Tab */}
                <TabsContent value="patients" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Assigned Patients</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredPatients.map((patient) => (
                                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {patient.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Room {patient.room} • {patient.condition}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Last vitals: {patient.lastVitals}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={
                                                patient.status === 'Critical' ? 'destructive' :
                                                    patient.status === 'Stable' ? 'default' : 'secondary'
                                            }>
                                                {patient.status}
                                            </Badge>
                                            {patient.alerts > 0 && (
                                                <Badge variant="destructive">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    {patient.alerts}
                                                </Badge>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPatientId(patient.id);
                                                    setShowVitalSignsForm(true);
                                                }}
                                            >
                                                <HeartPulse className="w-4 h-4 mr-1" />
                                                Vitals
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Vital Signs Alerts
                            </CardTitle>
                            <CardDescription>
                                Critical and abnormal vital signs requiring immediate attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vitalSignsAlerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${alert.severity === 'Critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                            alert.severity === 'High' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                                'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {alert.patientName}
                                                    </h3>
                                                    <Badge variant={
                                                        alert.severity === 'Critical' ? 'destructive' :
                                                            alert.severity === 'High' ? 'destructive' : 'secondary'
                                                    }>
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {alert.type}: <span className="font-medium">{alert.value}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {alert.room} • {alert.time}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Check
                                                </Button>
                                                <Button size="sm">
                                                    <Edit3 className="w-4 h-4 mr-1" />
                                                    Respond
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Daily Tasks
                            </CardTitle>
                            <CardDescription>
                                Your scheduled tasks and routines for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { time: "08:00", task: "Morning vital signs round", patients: "All patients", status: "completed" },
                                    { time: "10:00", task: "Medication administration", patients: "Room 201, 105", status: "pending" },
                                    { time: "12:00", task: "Lunch time vitals", patients: "Critical patients", status: "pending" },
                                    { time: "14:00", task: "Wound care assessment", patients: "Room 302", status: "pending" },
                                    { time: "16:00", task: "Evening vital signs round", patients: "All patients", status: "scheduled" },
                                ].map((task, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm font-medium text-gray-500 w-16">
                                                {task.time}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {task.task}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {task.patients}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            task.status === 'completed' ? 'default' :
                                                task.status === 'pending' ? 'destructive' : 'secondary'
                                        }>
                                            {task.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default NurseDashboard;
