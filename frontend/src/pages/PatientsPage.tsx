import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Mail, Calendar, MapPin, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { patientsApi, type Patient, type PatientFilters } from '@/api/patients';
import { toast } from 'sonner';

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const PatientsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState<string>('');

    // Debounce search term to avoid excessive API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Real API query with filters
    const { data: patientsData, isLoading, error, refetch } = useQuery({
        queryKey: ['patients', { searchTerm: debouncedSearchTerm, filterGender }],
        queryFn: async () => {
            const filters: PatientFilters = {};
            if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
            if (filterGender) filters.gender = filterGender;

            const response = await patientsApi.getAllPatients(filters);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const patients = patientsData?.patients || [];
    const patientCount = patientsData?.count || 0;

    // Handle gender filtering
    const handleGenderFilter = useCallback((gender: string) => {
        setFilterGender(gender);
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                    <p>Error loading patients: {error instanceof Error ? error.message : 'Unknown error'}</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Patient Management</h1>
                <Button>
                    <User className="w-4 h-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterGender}
                            onChange={(e) => handleGenderFilter(e.target.value)}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <div className="text-sm text-gray-500">
                            {patientCount} patients found
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Patients List */}
            <div className="grid gap-4">
                {patients.map((patient) => (
                    <Card key={patient._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {patient.firstName} {patient.lastName}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <Mail className="h-4 w-4" />
                                                <span>{patient.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Phone className="h-4 w-4" />
                                                <span>{patient.phone}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(patient.dob), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{patient.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={patient.gender === 'Male' ? 'default' : 'secondary'}>
                                        {patient.gender}
                                    </Badge>
                                    <Link to={`/patient-records/${patient._id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {patients.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        {searchTerm || filterGender ? 'No patients found matching your criteria.' : 'No patients found.'}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PatientsPage;
