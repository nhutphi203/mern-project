import fs from 'fs';
import path from 'path';

// Read the router file
const routerPath = path.join(process.cwd(), 'router', 'enhancedMedicalRecordRouter.js');
let content = fs.readFileSync(routerPath, 'utf8');

console.log('🔄 Removing encounterId populate calls...');

// Remove encounterId populate lines
const linesToRemove = [
    ".populate('encounterId', 'type status scheduledDateTime')",
    ".populate('encounterId', 'type status scheduledDateTime');",
];

let changeCount = 0;
linesToRemove.forEach(line => {
    const beforeCount = (content.match(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    content = content.replace(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    const changed = beforeCount;
    if (changed > 0) {
        console.log(`✅ Removed "${line}" (${changed} times)`);
        changeCount += changed;
    }
});

// Write back to file
fs.writeFileSync(routerPath, content);
console.log(`\n🎉 Total removals: ${changeCount}`);
console.log('✅ Router file updated successfully!');
