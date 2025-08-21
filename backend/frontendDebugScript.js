// Frontend Debug & Fix Script
// Paste this in browser console (F12)

console.log('🔧 FRONTEND DEBUG & FIX SCRIPT');

// 1. Clear all storage
console.log('1️⃣ Clearing all browser storage...');
localStorage.clear();
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log('✅ Storage cleared');

// 2. Check current JWT token (if any)
const checkTokens = () => {
    console.log('2️⃣ Checking for existing tokens...');

    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const cookieToken = document.cookie.match(/token=([^;]+)/);

    if (localToken) {
        console.log('❌ Found token in localStorage - removing...');
        localStorage.removeItem('token');
    }

    if (sessionToken) {
        console.log('❌ Found token in sessionStorage - removing...');
        sessionStorage.removeItem('token');
    }

    if (cookieToken) {
        console.log('❌ Found token in cookies - removing...');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    console.log('✅ All tokens removed');
};

checkTokens();

// 3. Test login with correct credentials
const testPatientLogin = async () => {
    console.log('3️⃣ Testing patient login...');

    try {
        const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'phinhut2003@gmail.com',
                password: '11111111',
                role: 'Patient'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Login successful');
            console.log('User Role:', data.user.role);
            console.log('Token received:', !!data.token);

            // Decode token to verify role
            if (data.token) {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                console.log('JWT Payload Role:', payload.role);

                if (payload.role === 'Patient') {
                    console.log('✅ JWT contains correct Patient role');
                } else {
                    console.log('❌ JWT role mismatch!', payload.role);
                }
            }
        } else {
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Login error:', error);
    }
};

// 4. Instructions
console.log(`
📋 NEXT STEPS:
1. Run testPatientLogin() to verify login works
2. Check if frontend is reading role correctly from JWT
3. Look for hardcoded admin routes in your frontend code
4. Verify role-based UI rendering logic

🧪 Test login function:
testPatientLogin();

🔄 Reload page after clearing storage:
location.reload();
`);

// Make function available globally
window.testPatientLogin = testPatientLogin;
