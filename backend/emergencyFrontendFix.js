// Emergency Frontend Fix Script
// Paste this into browser console (F12) to stop the redirect loop

console.log('🚨 EMERGENCY FRONTEND FIX SCRIPT');

// 1. Stop any ongoing navigation/redirects
console.log('1️⃣ Stopping navigation loops...');
if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Temporarily disable history manipulation
    window.history.pushState = function () {
        console.log('🛑 Blocked pushState:', arguments);
    };
    window.history.replaceState = function () {
        console.log('🛑 Blocked replaceState:', arguments);
    };

    setTimeout(() => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        console.log('✅ Re-enabled history functions');
    }, 5000);
}

// 2. Clear all authentication data
console.log('2️⃣ Clearing all auth data...');
localStorage.clear();
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Clear specific auth-related items
['token', 'user', 'authToken', 'userRole', 'currentUser', 'isAuthenticated'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
});

console.log('✅ All auth data cleared');

// 3. Force navigate to login page
console.log('3️⃣ Forcing navigation to login...');
setTimeout(() => {
    window.location.href = '/login';
}, 2000);

// 4. Debug current state
console.log('4️⃣ Current state debug:');
console.log('Current URL:', window.location.href);
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('SessionStorage keys:', Object.keys(sessionStorage));
console.log('Cookies:', document.cookie);

// 5. Check for React Router or Vue Router
if (window.ReactRouter) {
    console.log('Found React Router');
} else if (window.$router) {
    console.log('Found Vue Router');
} else {
    console.log('Router type unknown');
}

// 6. Emergency patient login function
window.emergencyPatientLogin = async function () {
    console.log('🔄 Attempting patient login...');

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

        if (data.success && data.user.role === 'Patient') {
            console.log('✅ Patient login successful');
            console.log('User data:', data.user);

            // Store token with explicit Patient role
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', 'Patient');
            localStorage.setItem('isPatient', 'true');
            localStorage.setItem('isAdmin', 'false');

            // Force navigate to patient dashboard
            console.log('🏥 Navigating to patient dashboard...');
            window.location.href = '/patient-dashboard';

        } else {
            console.log('❌ Login failed or wrong role');
        }
    } catch (error) {
        console.log('❌ Login error:', error);
    }
};

console.log(`
🆘 EMERGENCY ACTIONS AVAILABLE:

1. emergencyPatientLogin() - Re-login as patient
2. Clear all data and go to login page (happening automatically)

📋 MANUAL STEPS:
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Close all tabs and restart browser
3. Login again with correct credentials
4. Check frontend routing logic for role-based redirects

🔧 DEVELOPER NOTES:
- Frontend has a routing loop between admin-dashboard and dashboard
- Need to fix role-based routing logic
- Patient should NOT redirect to admin-dashboard
- Check authentication guards in routing
`);

// Auto-execute patient login after clearing data
setTimeout(() => {
    console.log('🔄 Auto-executing patient login...');
    window.emergencyPatientLogin();
}, 3000);
