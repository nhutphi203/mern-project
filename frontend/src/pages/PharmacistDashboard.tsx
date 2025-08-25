import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Pill, 
    AlertTriangle, 
    Package, 
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    RefreshCw,
    Search,
    FileText,
    User,
    Calendar
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import { format, subDays, isAfter } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Types for Pharmacist
interface PharmacyStats {
    prescriptionsToday: number;
    prescriptionsPending: number;
    prescriptionsReady: number;
    lowStockItems: number;
    expiringSoon: number;
    inventoryValue: number;
    averageProcessingTime: number;
    customerWaiting: number;
}

interface Prescription {
    _id: string;
    prescriptionNumber: string;
    patientId: {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
    };
    prescribedBy: {
        firstName: string;
        lastName: string;
        specialization: string;
    };
    medications: Array<{
        drugId: string;
        drugName: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions: string;
        available: boolean;
        inStock: number;
    }>;
    status: 'Pending' | 'In Progress' | 'Ready' | 'Dispensed' | 'Cancelled';
    priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    prescribedAt: string;
    readyAt?: string;
    dispensedAt?: string;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        copay: number;
    };
    totalCost: number;
    notes?: string;
}

interface InventoryItem {
    _id: string;
    drugName: string;
    genericName: string;
    manufacturer: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    unitPrice: number;
    expiryDate: string;
    batchNumber: string;
    location: string;
    category: string;
    isControlled: boolean;
}

interface DrugInteraction {
    drug1: string;
    drug2: string;
    severity: 'Minor' | 'Moderate' | 'Major';
    description: string;
    recommendation: string;
}

interface PrescriptionVolume {
    date: string;
    prescriptions: number;
    revenue: number;
}

// API functions
const pharmacyApi = {
    getPharmacyStats: async (): Promise<PharmacyStats> => {
        try {
            const response = await apiRequest<{ success: boolean; data: PharmacyStats }>('/api/v1/pharmacy/stats');
            return response.data || {
                prescriptionsToday: 0,
                prescriptionsPending: 0,
                prescriptionsReady: 0,
                lowStockItems: 0,
                expiringSoon: 0,
                inventoryValue: 0,
                averageProcessingTime: 0,
                customerWaiting: 0
            };
        } catch (error) {
            console.warn('Pharmacy stats endpoint not available:', error);
            return {
                prescriptionsToday: 0,
                prescriptionsPending: 0,
                prescriptionsReady: 0,
                lowStockItems: 0,
                expiringSoon: 0,
                inventoryValue: 0,
                averageProcessingTime: 0,
                customerWaiting: 0
            };
        }
    },
    
    getPrescriptions: async (params?: {
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
    }): Promise<Prescription[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.priority) queryParams.append('priority', params.priority);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            
            const endpoint = `/api/v1/pharmacy/prescriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiRequest<{ success: boolean; data: { prescriptions: Prescription[] } }>(endpoint);
            return response.data?.prescriptions || [];
        } catch (error) {
            console.warn('Prescriptions endpoint not available:', error);
            return [];
        }
    },
    
    getInventory: async (params?: {
        category?: string;
        lowStock?: boolean;
        expiring?: boolean;
    }): Promise<InventoryItem[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.category) queryParams.append('category', params.category);
            if (params?.lowStock) queryParams.append('lowStock', 'true');
            if (params?.expiring) queryParams.append('expiring', 'true');
            
            const endpoint = `/api/v1/pharmacy/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiRequest<{ success: boolean; data: InventoryItem[] }>(endpoint);
            return response.data || [];
        } catch (error) {
            console.warn('Inventory endpoint not available:', error);
            return [];
        }
    },
    
    checkDrugInteractions: async (medications: string[]): Promise<DrugInteraction[]> => {
        try {
            const response = await apiRequest<{ success: boolean; data: DrugInteraction[] }>('/api/v1/pharmacy/interactions', {
                method: 'POST',
                body: JSON.stringify({ medications })
            });
            return response.data || [];
        } catch (error) {
            console.warn('Drug interactions endpoint not available:', error);
            return [];
        }
    },
    
    getPrescriptionVolume: async (days: number = 7): Promise<PrescriptionVolume[]> => {
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const response = await apiRequest<{ success: boolean; data: PrescriptionVolume[] }>(
                `/api/v1/pharmacy/reports/volume?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );
            return response.data || [];
        } catch (error) {
            console.warn('Prescription volume endpoint not available:', error);
            // Return sample data for visualization
            return Array.from({ length: days }, (_, i) => {
                const date = subDays(new Date(), days - i - 1);
                return {
                    date: format(date, 'MMM dd'),
                    prescriptions: Math.floor(Math.random() * 50) + 10,
                    revenue: Math.floor(Math.random() * 100000) + 20000
                };
            });
        }
    },
    
    updatePrescriptionStatus: async (prescriptionId: string, status: string, notes?: string) => {
        return apiRequest(`/api/v1/pharmacy/prescriptions/${prescriptionId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes })
        });
    },
    
    dispensePrescription: async (prescriptionId: string, dispensedMedications: Array<{
        drugId: string;
        quantityDispensed: number;
        batchNumber: string;
    }>) => {
        return apiRequest(`/api/v1/pharmacy/prescriptions/${prescriptionId}/dispense`, {
            method: 'POST',
            body: JSON.stringify({ dispensedMedications })
        });
    }
};

// Sample category data
const categoryData = [
    { name: 'Antibiotics', value: 25, color: '#0088FE' },
    { name: 'Pain Relief', value: 20, color: '#00C49F' },
    { name: 'Cardiovascular', value: 18, color: '#FFBB28' },
    { name: 'Diabetes', value: 15, color: '#FF8042' },
    { name: 'Others', value: 22, color: '#8884D8' },
];

const PharmacistDashboard: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('7');
    const [prescriptionFilter, setPrescriptionFilter] = useState('all');
    const [inventoryFilter, setInventoryFilter] = useState('all');

    // Fetch data using TanStack Query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['pharmacy-stats'],
        queryFn: pharmacyApi.getPharmacyStats,
        refetchInterval: 60000, // 1 minute
    });

    const { data: prescriptions = [], isLoading: prescriptionsLoading, refetch: refetchPrescriptions } = useQuery({
        queryKey: ['prescriptions', prescriptionFilter],
        queryFn: () => pharmacyApi.getPrescriptions({ 
            status: prescriptionFilter === 'all' ? undefined : prescriptionFilter,
            limit: 20 
        }),
        refetchInterval: 30000,
    });

    const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
        queryKey: ['inventory', inventoryFilter],
        queryFn: () => pharmacyApi.getInventory({
            lowStock: inventoryFilter === 'low-stock',
            expiring: inventoryFilter === 'expiring'
        }),
        refetchInterval: 300000, // 5 minutes
    });

    const { data: volumeData = [], isLoading: volumeLoading } = useQuery({
        queryKey: ['prescription-volume', selectedPeriod],
        queryFn: () => pharmacyApi.getPrescriptionVolume(parseInt(selectedPeriod)),
        refetchInterval: 300000,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Ready': return 'bg-green-100 text-green-800';
            case 'Dispensed': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Normal': return 'bg-blue-100 text-blue-800';
            case 'Low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const isExpiringSoon = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return isAfter(thirtyDaysFromNow, expiry);
    };

    const handleUpdateStatus = async (prescriptionId: string, newStatus: string) => {
        try {
            await pharmacyApi.updatePrescriptionStatus(prescriptionId, newStatus);
            refetchPrescriptions();
        } catch (error) {
            console.error('Error updating prescription status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Pharmacist Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Prescription management and pharmacy operations
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Drug Lookup
                    </Button>
                    <Button size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Add Inventory
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prescriptions Today</CardTitle>
                        <Pill className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.prescriptionsToday || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.prescriptionsPending || 0} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : stats?.prescriptionsReady || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.customerWaiting || 0} customers waiting
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {stats?.lowStockItems || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.expiringSoon || 0} expiring soon
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statsLoading ? '...' : formatCurrency(stats?.inventoryValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg processing: {stats?.averageProcessingTime || 0}m
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Prescription Volume
                        </CardTitle>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {volumeLoading ? (
                            <div className="h-[300px] flex items-center justify-center">
                                Loading volume data...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={volumeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="prescriptions" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Drug Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="prescriptions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                Prescription Queue
                            </CardTitle>
                            <Select value={prescriptionFilter} onValueChange={setPrescriptionFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Prescriptions</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Ready">Ready</SelectItem>
                                    <SelectItem value="Dispensed">Dispensed</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {prescriptionsLoading ? (
                                <div className="text-center py-8">Loading prescriptions...</div>
                            ) : prescriptions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No prescriptions found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {prescriptions.map((prescription) => (
                                        <div key={prescription._id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                {prescription.prescriptionNumber}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {prescription.patientId.firstName} {prescription.patientId.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Prescribed by: Dr. {prescription.prescribedBy.firstName} {prescription.prescribedBy.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">
                                                                {formatCurrency(prescription.totalCost)}
                                                            </p>
                                                            {prescription.insuranceInfo && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Copay: {formatCurrency(prescription.insuranceInfo.copay)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-medium mb-1">Medications:</h5>
                                                        <div className="space-y-1">
                                                            {prescription.medications.map((med, index) => (
                                                                <div key={index} className="text-sm flex justify-between items-center">
                                                                    <span>
                                                                        {med.drugName} - {med.dosage} ({med.frequency})
                                                                    </span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-muted-foreground">
                                                                            Qty: {med.quantity}
                                                                        </span>
                                                                        {!med.available && (
                                                                            <Badge className="bg-red-100 text-red-800">
                                                                                Out of Stock
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <Badge className={getStatusColor(prescription.status)}>
                                                            {prescription.status}
                                                        </Badge>
                                                        <Badge className={getPriorityColor(prescription.priority)}>
                                                            {prescription.priority}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">
                                                            {format(new Date(prescription.prescribedAt), 'MMM dd, HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col space-y-2">
                                                    {prescription.status === 'Pending' && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(prescription._id, 'In Progress')}
                                                        >
                                                            <RefreshCw className="h-4 w-4 mr-1" />
                                                            Start Processing
                                                        </Button>
                                                    )}
                                                    {prescription.status === 'In Progress' && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(prescription._id, 'Ready')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Mark Ready
                                                        </Button>
                                                    )}
                                                    {prescription.status === 'Ready' && (
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                            <Package className="h-4 w-4 mr-1" />
                                                            Dispense
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Inventory Management
                            </CardTitle>
                            <Select value={inventoryFilter} onValueChange={setInventoryFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Items</SelectItem>
                                    <SelectItem value="low-stock">Low Stock</SelectItem>
                                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {inventoryLoading ? (
                                <div className="text-center py-8">Loading inventory...</div>
                            ) : inventory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No inventory items found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {inventory.map((item) => (
                                        <div key={item._id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div>
                                                            <h4 className="font-semibold">
                                                                {item.drugName}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Generic: {item.genericName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Manufacturer: {item.manufacturer}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Location: {item.location} | Batch: {item.batchNumber}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">
                                                                Stock: {item.currentStock}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Min: {item.minimumStock} | Max: {item.maximumStock}
                                                            </p>
                                                            <p className="text-sm">
                                                                Unit Price: {formatCurrency(item.unitPrice)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <Badge className={`${item.category === 'Controlled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {item.category}
                                                        </Badge>
                                                        {item.isControlled && (
                                                            <Badge className="bg-orange-100 text-orange-800">
                                                                Controlled
                                                            </Badge>
                                                        )}
                                                        {item.currentStock <= item.minimumStock && (
                                                            <Badge className="bg-red-100 text-red-800">
                                                                Low Stock
                                                            </Badge>
                                                        )}
                                                        {isExpiringSoon(item.expiryDate) && (
                                                            <Badge className="bg-yellow-100 text-yellow-800">
                                                                Expiring Soon
                                                            </Badge>
                                                        )}
                                                        <span className="text-sm text-muted-foreground">
                                                            Expires: {format(new Date(item.expiryDate), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Update Stock
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Drug Interactions Tab */}
                <TabsContent value="interactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Drug Interaction Checker
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Drug Interaction Checker
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Select medications from a prescription to check for potential interactions
                                    </p>
                                    <Button>
                                        <Search className="h-4 w-4 mr-2" />
                                        Check Interactions
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Pharmacy Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <BarChart3 className="h-6 w-6 mb-2" />
                                    Prescription Summary
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Package className="h-6 w-6 mb-2" />
                                    Inventory Report
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 mb-2" />
                                    Expiry Alert Report
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                                    <Clock className="h-6 w-6 mb-2" />
                                    Processing Time Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PharmacistDashboard;
