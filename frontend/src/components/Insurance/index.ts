// Insurance Components Index
export { default as InsuranceClaimsManagement } from './InsuranceClaimsManagement';
export { default as InsuranceClaimDetail } from './InsuranceClaimDetail';
export { default as InsuranceClaimsStatistics } from './InsuranceClaimsStatistics';

// Re-export types for convenience
export type {
    InsuranceClaim,
    PatientInsurance,
    InsuranceProvider
} from '@/api/insurance';
