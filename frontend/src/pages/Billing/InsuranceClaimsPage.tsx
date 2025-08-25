import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, Settings } from 'lucide-react';
import InsuranceClaimsManagement from '@/components/Insurance/InsuranceClaimsManagement';
import InsuranceClaimDetail from '@/components/Insurance/InsuranceClaimDetail';
import InsuranceClaimsStatistics from '@/components/Insurance/InsuranceClaimsStatistics';

const InsuranceClaimsPage: React.FC = () => {
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('management');

    const handleViewClaimDetail = (claimId: string) => {
        setSelectedClaimId(claimId);
        setActiveTab('detail');
    };

    const handleBackToManagement = () => {
        setSelectedClaimId(null);
        setActiveTab('management');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Insurance Claims</h1>
                <p className="text-gray-600">
                    Comprehensive insurance claims management and processing system
                </p>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="management" className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Claims Management
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Claims Management Tab */}
                <TabsContent value="management">
                    <InsuranceClaimsManagement />
                </TabsContent>

                {/* Claim Detail Tab */}
                <TabsContent value="detail">
                    {selectedClaimId ? (
                        <InsuranceClaimDetail
                            claimId={selectedClaimId}
                            onBack={handleBackToManagement}
                        />
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No Claim Selected
                                    </h3>
                                    <p className="text-gray-500">
                                        Select a claim from the management tab to view details.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <InsuranceClaimsStatistics />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Insurance Claims Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">System Configuration</h3>
                                <p className="text-gray-600 mb-6">
                                    Configure insurance providers, claim processing rules,
                                    automated workflows, and system integrations.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InsuranceClaimsPage;


