/**
 * Billing & Financial Data Factory - Creates comprehensive billing test data
 * Learned from Phase 1&2&3: No external dependencies, pure JavaScript implementation
 * Ensures consistent data generation without ES module conflicts
 */

class BillingFactory {
  /**
   * Create comprehensive invoice/bill
   */
  static createInvoice(patientId, appointmentIds = [], labTestIds = [], overrides = {}) {
    const billingTypes = ['Medical Services', 'Lab Tests', 'Procedures', 'Emergency Care', 'Pharmacy'];
    const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance'];
    const invoiceStatuses = ['Draft', 'Pending', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];

    const baseInvoice = {
      invoiceId: this.generateInvoiceId(),
      invoiceNumber: this.generateInvoiceNumber(),
      patientId,

      // Associated Services
      appointmentIds: appointmentIds,
      labTestIds: labTestIds,

      // Invoice Details
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      serviceDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),

      // Financial Information
      subtotal: this.randomFloat(100, 2000, 2),
      taxAmount: 0, // Will be calculated
      discountAmount: this.randomFloat(0, 200, 2),
      adjustmentAmount: this.randomFloat(-50, 50, 2),
      totalAmount: 0, // Will be calculated
      paidAmount: 0,
      balanceAmount: 0, // Will be calculated

      // Billing Classification
      billingType: this.getRandomElement(billingTypes),
      department: this.getRandomElement(['Emergency', 'Outpatient', 'Inpatient', 'Laboratory', 'Radiology']),
      facilityCode: this.generateFacilityCode(),

      // Payment Information
      paymentStatus: this.getRandomElement(['Pending', 'Partial', 'Paid', 'Overdue']),
      preferredPaymentMethod: this.getRandomElement(paymentMethods),
      paymentTerms: this.getRandomElement(['Net 30', 'Net 15', 'Due on Receipt', 'Net 60']),

      // Insurance Information
      primaryInsurance: this.createInsuranceInfo('Primary'),
      secondaryInsurance: Math.random() > 0.7 ? this.createInsuranceInfo('Secondary') : null,
      insuranceClaimNumber: this.generateClaimNumber(),
      insuranceStatus: this.getRandomElement(['Pending', 'Approved', 'Denied', 'Under Review']),

      // Line Items
      lineItems: [], // Will be populated with services

      // Tax Information
      taxRate: 0.08, // 8% default
      taxExempt: this.getRandomElement([true, false]),
      taxId: this.generateTaxId(),

      // Status and Workflow
      status: this.getRandomElement(invoiceStatuses),
      workflowStage: this.getRandomElement(['Generation', 'Review', 'Approval', 'Sent', 'Collection']),

      // Audit Trail
      createdBy: this.generateStaffId(),
      approvedBy: null,
      sentBy: null,
      lastModifiedBy: null,

      // Communication
      emailSent: this.getRandomElement([true, false]),
      lastEmailDate: null,
      remindersSent: this.randomInt(0, 3),

      // Collection Information
      collectionStatus: this.getRandomElement(['Current', '30 Days', '60 Days', '90+ Days', 'Collections']),
      collectionAgency: null,
      writeOffAmount: 0,

      // Notes and Comments
      notes: this.getRandomElement([
        null,
        'Patient payment plan requested',
        'Insurance pending verification',
        'Prior authorization required',
        'Billing inquiry received'
      ]),

      internalNotes: this.getRandomElement([
        null,
        'Follow up with insurance',
        'Patient called regarding bill',
        'Dispute filed by patient'
      ]),

      // Metadata
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate totals
    baseInvoice.taxAmount = baseInvoice.taxExempt ? 0 : baseInvoice.subtotal * baseInvoice.taxRate;
    baseInvoice.totalAmount = baseInvoice.subtotal + baseInvoice.taxAmount - baseInvoice.discountAmount + baseInvoice.adjustmentAmount;
    baseInvoice.balanceAmount = baseInvoice.totalAmount - baseInvoice.paidAmount;

    return { ...baseInvoice, ...overrides };
  }

  /**
   * Create invoice line item
   */
  static createLineItem(description, overrides = {}) {
    const baseItem = {
      lineItemId: this.generateLineItemId(),
      itemCode: this.generateItemCode(),
      description: description || this.getRandomElement([
        'Office Visit - Level 3',
        'Laboratory Test - CBC',
        'X-Ray - Chest',
        'Consultation Fee',
        'Procedure - Minor'
      ]),

      // Quantity and Pricing
      quantity: this.randomInt(1, 5),
      unitPrice: this.randomFloat(25, 500, 2),
      totalPrice: 0, // Will be calculated

      // Coding Information
      cptCode: this.generateCPTCode(),
      icd10Code: this.generateICD10Code(),
      modifiers: this.getRandomElements(['25', '59', 'TC', 'GA'], { min: 0, max: 2 }),

      // Service Details
      serviceDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      provider: this.generateProviderId(),
      facility: this.generateFacilityCode(),

      // Insurance and Payment
      allowedAmount: this.randomFloat(20, 400, 2),
      contractualAdjustment: this.randomFloat(0, 100, 2),
      copayAmount: this.randomFloat(5, 50, 2),
      deductibleAmount: this.randomFloat(0, 100, 2),
      coinsuranceAmount: this.randomFloat(0, 80, 2),

      // Status
      status: this.getRandomElement(['Pending', 'Processed', 'Denied', 'Approved']),
      denialReason: null,

      // Revenue Information
      revenueCode: this.generateRevenueCode(),
      costCenter: this.getRandomElement(['Emergency', 'Outpatient', 'Laboratory', 'Radiology']),

      // Tax Information
      taxable: this.getRandomElement([true, false]),
      taxRate: 0.08,
      taxAmount: 0 // Will be calculated
    };

    // Calculate totals
    baseItem.totalPrice = baseItem.quantity * baseItem.unitPrice;
    baseItem.taxAmount = baseItem.taxable ? baseItem.totalPrice * baseItem.taxRate : 0;

    return { ...baseItem, ...overrides };
  }

  /**
   * Create payment record
   */
  static createPayment(invoiceId, overrides = {}) {
    const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance Payment'];
    const paymentTypes = ['Full Payment', 'Partial Payment', 'Copay', 'Deductible', 'Coinsurance'];

    const basePayment = {
      paymentId: this.generatePaymentId(),
      invoiceId,

      // Payment Details
      amount: this.randomFloat(50, 1000, 2),
      paymentDate: new Date(),
      paymentMethod: this.getRandomElement(paymentMethods),
      paymentType: this.getRandomElement(paymentTypes),

      // Transaction Information
      transactionId: this.generateTransactionId(),
      referenceNumber: this.generateReferenceNumber(),
      confirmationNumber: this.generateConfirmationNumber(),

      // Payment Source
      payerName: this.getRandomElement([
        'Patient Payment',
        'Blue Cross Blue Shield',
        'Aetna',
        'UnitedHealthcare',
        'Medicare',
        'Medicaid'
      ]),

      payerType: this.getRandomElement(['Patient', 'Primary Insurance', 'Secondary Insurance', 'Government']),

      // Card/Check Information (if applicable)
      lastFourDigits: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      authorizationCode: this.generateAuthCode(),
      batchNumber: this.generateBatchNumber(),

      // Bank Information (if applicable)
      bankName: this.getRandomElement(['Chase', 'Bank of America', 'Wells Fargo', 'US Bank']),
      routingNumber: '123456789',
      accountType: this.getRandomElement(['Checking', 'Savings']),

      // Processing Information
      processingFee: this.randomFloat(0, 5, 2),
      netAmount: 0, // Will be calculated
      status: this.getRandomElement(['Pending', 'Completed', 'Failed', 'Reversed']),

      // Reconciliation
      depositDate: new Date(),
      batchId: this.generateBatchId(),
      reconciledDate: null,
      reconciliationStatus: this.getRandomElement(['Pending', 'Reconciled', 'Discrepancy']),

      // Notes
      paymentNotes: this.getRandomElement([
        null,
        'Patient payment via portal',
        'Insurance EOB received',
        'Partial payment arrangement',
        'Refund processed'
      ]),

      // Processed By
      processedBy: this.generateStaffId(),
      approvedBy: null,

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate net amount
    basePayment.netAmount = basePayment.amount - basePayment.processingFee;

    return { ...basePayment, ...overrides };
  }

  /**
   * Create insurance claim
   */
  static createInsuranceClaim(patientId, invoiceId, overrides = {}) {
    const claimTypes = ['Medical', 'Dental', 'Vision', 'Pharmacy'];
    const claimStatuses = ['Draft', 'Submitted', 'Pending', 'Approved', 'Denied', 'Paid'];

    const baseClaim = {
      claimId: this.generateClaimId(),
      claimNumber: this.generateClaimNumber(),
      patientId,
      invoiceId,

      // Claim Information
      claimType: this.getRandomElement(claimTypes),
      submissionDate: new Date(),
      serviceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),

      // Insurance Information
      insuranceCompany: this.getRandomElement([
        'Blue Cross Blue Shield',
        'Aetna',
        'UnitedHealthcare',
        'Cigna',
        'Humana',
        'Medicare',
        'Medicaid'
      ]),

      policyNumber: this.generatePolicyNumber(),
      groupNumber: this.generateGroupNumber(),
      memberId: this.generateMemberId(),

      // Provider Information
      providerId: this.generateProviderId(),
      providerNPI: this.generateNPI(),
      facilityNPI: this.generateNPI(),
      taxId: this.generateTaxId(),

      // Financial Information
      chargedAmount: this.randomFloat(200, 2000, 2),
      allowedAmount: this.randomFloat(150, 1500, 2),
      paidAmount: this.randomFloat(100, 1200, 2),
      deniedAmount: this.randomFloat(0, 500, 2),
      adjustmentAmount: this.randomFloat(0, 300, 2),

      // Patient Responsibility
      deductibleAmount: this.randomFloat(0, 200, 2),
      copayAmount: this.randomFloat(10, 50, 2),
      coinsuranceAmount: this.randomFloat(0, 100, 2),
      patientResponsibility: 0, // Will be calculated

      // Status and Processing
      status: this.getRandomElement(claimStatuses),
      processingStage: this.getRandomElement(['Initial', 'Review', 'Adjudication', 'Payment', 'Completed']),

      // Denial Information
      denialCode: this.getRandomElement([null, 'CO-1', 'CO-2', 'CO-11', 'CO-15']),
      denialReason: this.getRandomElement([
        null,
        'Procedure not covered',
        'Pre-authorization required',
        'Duplicate claim',
        'Missing information'
      ]),

      // EOB Information
      eobReceived: this.getRandomElement([true, false]),
      eobDate: null,
      checkNumber: this.generateCheckNumber(),

      // Resubmission Information
      originalClaimId: null,
      resubmissionCount: 0,
      appealCount: 0,

      // Electronic Processing
      clearinghouse: this.getRandomElement(['Change Healthcare', 'Availity', 'Trizetto']),
      electronicClaimId: this.generateElectronicClaimId(),
      x12TransactionId: this.generateX12TransactionId(),

      // Notes
      claimNotes: this.getRandomElement([
        null,
        'Prior authorization verified',
        'Patient eligibility confirmed',
        'Claim requires manual review'
      ]),

      // Audit Information
      submittedBy: this.generateStaffId(),
      reviewedBy: null,

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate patient responsibility
    baseClaim.patientResponsibility = baseClaim.deductibleAmount + baseClaim.copayAmount + baseClaim.coinsuranceAmount;

    return { ...baseClaim, ...overrides };
  }

  /**
   * Create financial report data
   */
  static createFinancialReport(reportType, overrides = {}) {
    const reportTypes = ['Daily Revenue', 'Monthly Summary', 'Insurance Analytics', 'Aging Report', 'Denial Analysis'];

    const baseReport = {
      reportId: this.generateReportId(),
      reportType: reportType || this.getRandomElement(reportTypes),
      reportDate: new Date(),

      // Date Range
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),

      // Financial Metrics
      totalCharges: this.randomFloat(10000, 100000, 2),
      totalPayments: this.randomFloat(8000, 80000, 2),
      totalAdjustments: this.randomFloat(500, 5000, 2),
      netRevenue: 0, // Will be calculated

      // Payment Analytics
      cashPayments: this.randomFloat(1000, 10000, 2),
      insurancePayments: this.randomFloat(6000, 60000, 2),
      creditCardPayments: this.randomFloat(1000, 10000, 2),

      // Outstanding Balances
      currentBalance: this.randomFloat(5000, 50000, 2),
      thirtyDayBalance: this.randomFloat(2000, 20000, 2),
      sixtyDayBalance: this.randomFloat(1000, 10000, 2),
      ninetyPlusDayBalance: this.randomFloat(500, 5000, 2),

      // Performance Metrics
      collectionRate: this.randomFloat(85, 98, 2),
      denialRate: this.randomFloat(2, 15, 2),
      daysInAR: this.randomFloat(30, 60, 1),

      // Volume Metrics
      totalClaims: this.randomInt(100, 1000),
      approvedClaims: this.randomInt(80, 950),
      deniedClaims: this.randomInt(5, 100),
      pendingClaims: this.randomInt(10, 150),

      // Top Performing Areas
      topPayingInsurers: [
        { name: 'Blue Cross Blue Shield', amount: this.randomFloat(10000, 30000, 2) },
        { name: 'UnitedHealthcare', amount: this.randomFloat(8000, 25000, 2) },
        { name: 'Aetna', amount: this.randomFloat(6000, 20000, 2) }
      ],

      topRevenueServices: [
        { service: 'Emergency Services', amount: this.randomFloat(15000, 40000, 2) },
        { service: 'Laboratory Tests', amount: this.randomFloat(10000, 30000, 2) },
        { service: 'Outpatient Visits', amount: this.randomFloat(8000, 25000, 2) }
      ],

      // Generated Information
      generatedBy: this.generateStaffId(),
      generatedAt: new Date(),
      parameters: {
        includeAdjustments: true,
        includeWriteOffs: true,
        groupByDepartment: false
      }
    };

    // Calculate net revenue
    baseReport.netRevenue = baseReport.totalCharges - baseReport.totalAdjustments;

    return { ...baseReport, ...overrides };
  }

  /**
   * Create insurance information object
   */
  static createInsuranceInfo(type = 'Primary') {
    return {
      insuranceType: type,
      companyName: this.getRandomElement([
        'Blue Cross Blue Shield',
        'Aetna',
        'UnitedHealthcare',
        'Cigna',
        'Humana'
      ]),
      policyNumber: this.generatePolicyNumber(),
      groupNumber: this.generateGroupNumber(),
      memberId: this.generateMemberId(),
      effectiveDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      copayAmount: this.randomFloat(10, 50, 2),
      deductibleAmount: this.randomFloat(500, 3000, 2),
      deductibleMet: this.randomFloat(0, 3000, 2),
      outOfPocketMax: this.randomFloat(3000, 8000, 2),
      outOfPocketMet: this.randomFloat(0, 8000, 2),
      coverageLevel: this.getRandomElement(['Individual', 'Family', 'Employee + Spouse', 'Employee + Children'])
    };
  }

  /**
   * Create bulk billing data for performance testing
   */
  static createBulkInvoices(count = 50, patientIds = []) {
    const invoices = [];

    for (let i = 0; i < count; i++) {
      const patientId = this.getRandomElement(patientIds);
      const appointmentIds = [this.generateAppointmentId()];
      const labTestIds = Math.random() > 0.5 ? [this.generateLabTestId()] : [];

      invoices.push(this.createInvoice(patientId, appointmentIds, labTestIds));
    }

    return invoices;
  }

  // ID Generation Methods
  static generateInvoiceId() {
    return `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateInvoiceNumber() {
    return `${new Date().getFullYear()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateLineItemId() {
    return `LI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  static generatePaymentId() {
    return `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateClaimId() {
    return `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateReportId() {
    return `RPT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
  }

  static generateClaimNumber() {
    return `CN${new Date().getFullYear()}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateTransactionId() {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  static generateReferenceNumber() {
    return Math.floor(Math.random() * 1000000000).toString();
  }

  static generateConfirmationNumber() {
    return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  }

  static generateAuthCode() {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  static generateBatchNumber() {
    return `B${new Date().toISOString().split('T')[0].replace(/-/g, '')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  static generateBatchId() {
    return `BATCH-${Date.now()}`;
  }

  static generatePolicyNumber() {
    return `POL${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  }

  static generateGroupNumber() {
    return `GRP${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateMemberId() {
    return `MEM${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  }

  static generateItemCode() {
    return `ITEM-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static generateCPTCode() {
    return this.randomInt(90000, 99999).toString();
  }

  static generateICD10Code() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters.charAt(Math.floor(Math.random() * letters.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  static generateRevenueCode() {
    return this.randomInt(100, 999).toString();
  }

  static generateProviderId() {
    return `PROV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static generateFacilityCode() {
    return `FAC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  static generateNPI() {
    return Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  }

  static generateTaxId() {
    return `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
  }

  static generateCheckNumber() {
    return Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  }

  static generateElectronicClaimId() {
    return `EC${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  static generateX12TransactionId() {
    return `X12${Date.now()}${Math.floor(Math.random() * 100)}`;
  }

  static generateStaffId() {
    return `STAFF-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static generateAppointmentId() {
    return `APT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  static generateLabTestId() {
    return `LAB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  }

  // Utility methods (consistent with other factories)
  static getRandomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  static getRandomElements(array, { min = 1, max = array.length } = {}) {
    if (!array || array.length === 0) return [];
    const count = this.randomInt(min, Math.min(max, array.length));
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }
}

module.exports = BillingFactory;
