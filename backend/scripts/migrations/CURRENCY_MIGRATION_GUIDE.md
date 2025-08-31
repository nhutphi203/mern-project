# Currency Standardization Migration Guide

## 🎯 Overview
Migrate all pricing from VNĐ to USD using exchange rate: **1 USD = 24,000 VNĐ**

## ⚠️ CRITICAL - Pre-Migration Steps

### 1. Backup Database
```bash
# MongoDB backup
mongodump --uri="your_mongo_uri" --out=./backup_before_currency_migration

# Or use built-in backup in migration script
```

### 2. Test Environment First
```bash
# Run on staging/test environment first
node scripts/migrations/testCurrencyConversion.js
```

## 🔄 Migration Steps

### Step 1: Test the Conversion Logic
```bash
cd backend
node scripts/migrations/testCurrencyConversion.js
```

### Step 2: Run the Migration
```bash
cd backend
node scripts/migrations/currencyStandardization.js
```

### Step 3: Verify Results
Check the migration output and verify sample data conversion.

## 📊 What Gets Converted

### Database Collections:
- **ServiceCatalog**: `price` field (VNĐ → USD)
- **LabTest**: `price` field (VNĐ → USD)  
- **Invoice**: All financial fields:
  - `subtotal`, `totalAmount`, `balance`, `totalPaid`
  - `items[].unitPrice`, `items[].totalPrice`, `items[].netAmount`
  - `insurance.coverageAmount`, `insurance.patientResponsibility`
  - `payments[].amount`

### Conversion Examples:
```
200,000 VNĐ → $8.33
150,000 VNĐ → $6.25
300,000 VNĐ → $12.50
25,000 VNĐ → $1.04
```

## 🖥️ Frontend Updates Needed

### 1. Update Display Components
```typescript
// Change from:
{amount.toLocaleString('vi-VN')} VNĐ

// To:
${amount.toFixed(2)}
```

### 2. Update Form Validation
```typescript
// Update price input validations to expect USD ranges
// Old: 10,000 - 1,000,000 VNĐ
// New: $0.42 - $41.67
```

### 3. Update API Documentation
Update all financial API documentation to reflect USD currency.

## 🧪 Seeding Scripts Update

### Update Default Prices in seedRealisticBilling.js:
```javascript
const defaultPricesUSD = {
    'consultation': 8.33,      // was 200,000 VNĐ
    'general medicine': 6.25,  // was 150,000 VNĐ
    'neurology': 12.50,        // was 300,000 VNĐ
    'prescription': 2.08,      // was 50,000 VNĐ
    'CBC': 1.04,              // was 25,000 VNĐ
    'ESR': 0.63,              // was 15,000 VNĐ
    'paracetamol': 0.83,      // was 20,000 VNĐ
    'amoxicillin': 1.25       // was 30,000 VNĐ
};
```

## ✅ Post-Migration Checklist

### Backend:
- [ ] All invoices show USD amounts
- [ ] Service catalog prices in USD
- [ ] Lab test prices in USD
- [ ] API responses return USD values
- [ ] Billing calculations work correctly

### Frontend:
- [ ] Invoice displays show $X.XX format
- [ ] Payment forms accept USD amounts
- [ ] Lab order forms show USD prices
- [ ] Billing reports show USD totals
- [ ] No VNĐ symbols anywhere

### Documentation:
- [ ] Update user guides about currency change
- [ ] Update API documentation
- [ ] Update financial policies
- [ ] Notify users about currency standardization

## 🚨 Rollback Plan

If migration fails:
1. Stop the application
2. Restore from backup:
   ```bash
   mongorestore --uri="your_mongo_uri" ./backup_before_currency_migration
   ```
3. Restart application
4. Debug migration issues

## 📞 Support

Contact development team if:
- Migration fails partway through
- Data integrity issues found
- Frontend display issues after migration
- Calculation errors detected

---
**Migration prepared by**: Development Team  
**Test environment**: Required before production  
**Estimated downtime**: 5-10 minutes  
**Rollback time**: 2-3 minutes
