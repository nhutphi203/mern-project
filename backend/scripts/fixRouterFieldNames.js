import fs from 'fs';
import path from 'path';

// Read the router file
const routerPath = path.join(process.cwd(), 'router', 'enhancedMedicalRecordRouter.js');
let content = fs.readFileSync(routerPath, 'utf8');

console.log('🔄 Replacing primaryProviderId with doctorId in router...');

// Replace all occurrences
const replacements = [
    // Filter assignments
    { from: 'filter.primaryProviderId = user._id', to: 'filter.doctorId = user._id' },
    { from: 'filter.primaryProviderId = doctorId', to: 'filter.doctorId = doctorId' },

    // Populate calls
    { from: ".populate('primaryProviderId'", to: ".populate('doctorId'" },

    // Object property access
    { from: 'record.primaryProviderId?.', to: 'record.doctorId?.' },
];

let changeCount = 0;
replacements.forEach(({ from, to }) => {
    const beforeCount = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    const afterCount = (content.match(new RegExp(to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const changed = beforeCount;
    if (changed > 0) {
        console.log(`✅ Replaced "${from}" -> "${to}" (${changed} times)`);
        changeCount += changed;
    }
});

// Write back to file
fs.writeFileSync(routerPath, content);
console.log(`\n🎉 Total replacements: ${changeCount}`);
console.log('✅ Router file updated successfully!');
