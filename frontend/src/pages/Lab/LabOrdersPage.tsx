import React, { useState, useEffect } from 'react';
import LabOrderForm from '@/components/Lab/LabOrderForm';
import { LabOrder } from '@/api/lab.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { encountersApi, type Encounter } from '@/api/encounters';
import { useCurrentUser } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';

const LabOrdersPage: React.FC = () => {
    const { data: currentUser } = useCurrentUser();
    const userId = currentUser?.user?._id;
    const userRole = currentUser?.user?.role;

    const [encounterId, setEncounterId] = useState('');
    const [patientId, setPatientId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleContinue = () => {
        if (!encounterId || !patientId || !patientName) {
            toast.error('Please enter Encounter ID, Patient ID and Patient Name');
            return;
        }
        setShowForm(true);
    };

    // Fetch recent encounters on component mount
    useEffect(() => {
        const fetchEncounters = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await encountersApi.getRecentEncounters(
                    userRole === 'Doctor' ? userId : undefined
                );
                setEncounters(response.data?.encounters || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch encounters');
                toast.error('Failed to load recent encounters');
            } finally {
                setLoading(false);
            }
        };

        fetchEncounters();
    }, [userId, userRole]);

    const handleSelectEncounter = (encounter: Encounter) => {
        setEncounterId(encounter._id);
        setPatientId(encounter.patientId?._id || '');
        setPatientName(
            encounter.patientId
                ? `${encounter.patientId.firstName} ${encounter.patientId.lastName}`
                : ''
        );
        setShowForm(true);
    };

    const handleSuccess = (order: LabOrder) => {
        toast.success(`Order ${order.orderId} created`);
        setShowForm(false);
        setEncounterId('');
        setPatientId('');
        setPatientName('');
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Lab Orders</h1>
            {!showForm ? (
                <div className="space-y-6">
                    {/* Quick Selection from Recent Encounters */}
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Recent Encounters</h3>

                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading encounters...</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center py-8 text-red-600">
                                <AlertCircle className="h-6 w-6 mr-2" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!loading && !error && encounters.length > 0 && (
                            <div className="grid gap-3">
                                {encounters.map((encounter) => (
                                    <div key={encounter._id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium">
                                                {encounter.patientId
                                                    ? `${encounter.patientId.firstName} ${encounter.patientId.lastName}`
                                                    : 'Unknown Patient'}
                                            </p>
                                            <p className="text-sm text-gray-600">Encounter: {encounter._id}</p>
                                            <p className="text-sm text-gray-600">Date: {new Date(encounter.checkInTime).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-600">Status: {encounter.status}</p>
                                        </div>
                                        <Button onClick={() => handleSelectEncounter(encounter)}>
                                            Select & Create Lab Order
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && !error && encounters.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No recent encounters found.</p>
                                <p className="text-sm">Patients need to be checked in first.</p>
                            </div>
                        )}
                    </div>

                    {/* Manual Entry (Fallback) */}
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Encounter ID</label>
                                <input
                                    value={encounterId}
                                    onChange={(e) => setEncounterId(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="e.g. 65f..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Patient ID</label>
                                    <input
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="e.g. 65f..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Patient Name</label>
                                    <input
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleContinue} className="px-4 py-2 bg-blue-600 text-white rounded">Continue</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LabOrderForm
                    encounterId={encounterId}
                    patientId={patientId}
                    patientName={patientName}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default LabOrdersPage;


