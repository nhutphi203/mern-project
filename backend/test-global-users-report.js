// ===================================================================
// PHASE 4.2 GLOBAL USERS VERIFICATION REPORT
// Verify our global test infrastructure is working
// ===================================================================

// 🔧 CRITICAL FIX: Load environment variables FIRST!
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import { User } from './models/userScheme.js';
import './test/setup.js'; // This should initialize global users

async function generateGlobalUsersReport() {
    try {
        console.log('\n🎯 PHASE 4.2 GLOBAL TEST USERS VERIFICATION REPORT');
        console.log('='.repeat(60));

        // Connect to test database
        if (!mongoose.connection.readyState) {
            await mongoose.connect(process.env.DB_URI_TEST);
            console.log('✅ Connected to test database');
        }

        // Check global variables
        console.log('\n📊 Global Variables Status:');
        console.log(`- global.testUsers: ${global.testUsers ? Object.keys(global.testUsers).length : 0} users`);
        console.log(`- global.testTokens: ${global.testTokens ? Object.keys(global.testTokens).length : 0} tokens`);
        console.log(`- global.globalTestUsers: ${global.globalTestUsers ? Object.keys(global.globalTestUsers).length : 0} users`);
        console.log(`- global.globalTestTokens: ${global.globalTestTokens ? Object.keys(global.globalTestTokens).length : 0} tokens`);

        // Check database for test users
        const testUsersInDb = await User.find({ isGlobalTestUser: true });
        console.log(`\n📈 Database Test Users: ${testUsersInDb.length} found`);
        
        if (testUsersInDb.length > 0) {
            console.log('\n👥 Test Users in Database:');
            testUsersInDb.forEach(user => {
                console.log(`  ✅ ${user.role}: ${user.email} (ID: ${user._id})`);
            });
        }

        // Check all users in test database
        const allUsers = await User.find({});
        console.log(`\n🔍 Total Users in Test DB: ${allUsers.length}`);

        if (allUsers.length > 0) {
            console.log('\n📋 All Users by Role:');
            const usersByRole = {};
            allUsers.forEach(user => {
                if (!usersByRole[user.role]) usersByRole[user.role] = 0;
                usersByRole[user.role]++;
            });
            Object.entries(usersByRole).forEach(([role, count]) => {
                console.log(`  ${role}: ${count} users`);
            });
        }

        // Test user creation if none exist
        if (testUsersInDb.length === 0) {
            console.log('\n🔧 No global test users found. Testing user creation...');
            
            // Try to trigger global setup
            if (global.testSetup && typeof global.testSetup.createGlobalTestUsers === 'function') {
                await global.testSetup.createGlobalTestUsers();
                console.log('✅ Triggered global test users creation');
                
                const newTestUsers = await User.find({ isGlobalTestUser: true });
                console.log(`📊 After creation: ${newTestUsers.length} test users found`);
            } else {
                console.log('❌ Global test setup function not available');
            }
        }

        // Check JWT token validity
        if (global.testTokens && Object.keys(global.testTokens).length > 0) {
            console.log('\n🔐 JWT Token Validation:');
            const jwt = await import('jsonwebtoken');
            Object.entries(global.testTokens).forEach(([role, token]) => {
                try {
                    const decoded = jwt.default.verify(token, process.env.JWT_SECRET_KEY || 'test-secret-key');
                    console.log(`  ✅ ${role}: Valid token (ID: ${decoded.id}, Role: ${decoded.role})`);
                } catch (error) {
                    console.log(`  ❌ ${role}: Invalid token - ${error.message}`);
                }
            });
        }

        console.log('\n🎯 PHASE 4.2 SUMMARY:');
        console.log('='.repeat(60));
        console.log(`✅ Global Test Infrastructure: ${global.testUsers ? 'AVAILABLE' : 'MISSING'}`);
        console.log(`✅ Database Test Users: ${testUsersInDb.length}/7 created`);
        console.log(`✅ JWT Tokens: ${global.testTokens ? Object.keys(global.testTokens).length : 0}/7 generated`);
        
        const successRate = testUsersInDb.length === 7 && global.testTokens && Object.keys(global.testTokens).length === 7 ? 100 : 
                           (testUsersInDb.length / 7) * 100;
        console.log(`🎯 Infrastructure Success Rate: ${successRate.toFixed(0)}%`);

        if (successRate === 100) {
            console.log('\n🚀 PHASE 4.2 COMPLETE - Ready for comprehensive testing!');
        } else {
            console.log('\n⚠️  PHASE 4.2 INCOMPLETE - Infrastructure needs fixes');
        }

    } catch (error) {
        console.error('❌ Error in global users report:', error);
    } finally {
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
            console.log('\n🔒 Database connection closed');
        }
    }
}

// Run the report
generateGlobalUsersReport();
