// STOP FRONTEND REQUEST LOOP SCRIPT
// Paste this in browser console immediately to stop the spam

console.log('🛑 STOPPING FRONTEND REQUEST LOOP');

// 1. Block all outgoing API requests temporarily
const originalFetch = window.fetch;
const originalXHR = window.XMLHttpRequest;

let blockedRequests = 0;

// Block fetch requests
window.fetch = function (...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/api/v1/')) {
        console.log('🚫 BLOCKED FETCH REQUEST:', url);
        blockedRequests++;
        return Promise.reject(new Error('Request blocked to stop loop'));
    }
    return originalFetch.apply(this, args);
};

// Block XMLHttpRequest
window.XMLHttpRequest = function () {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;

    xhr.open = function (method, url, ...args) {
        if (typeof url === 'string' && url.includes('/api/v1/')) {
            console.log('🚫 BLOCKED XHR REQUEST:', method, url);
            blockedRequests++;
            throw new Error('XHR Request blocked to stop loop');
        }
        return originalOpen.apply(this, [method, url, ...args]);
    };

    return xhr;
};

console.log('✅ API requests blocked. Blocked count will be tracked.');

// 2. Clear all authentication and navigation
setTimeout(() => {
    console.log(`📊 Total blocked requests: ${blockedRequests}`);
    console.log('🧹 Clearing all auth data...');

    localStorage.clear();
    sessionStorage.clear();

    // Clear specific items that might cause loops
    ['token', 'user', 'currentUser', 'userRole', 'isAuthenticated', 'authToken'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    // Clear cookies
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('✅ Auth data cleared');
}, 1000);

// 3. Force navigation to login after clearing
setTimeout(() => {
    console.log('🔄 Restoring fetch and navigating to login...');

    // Restore original functions
    window.fetch = originalFetch;
    window.XMLHttpRequest = originalXHR;

    // Force navigate to login
    window.location.href = '/login';
}, 3000);

// 4. Display immediate instructions
console.log(`
🆘 EMERGENCY LOOP STOP ACTIVATED!

📊 What's happening:
- Frontend is spam calling admin endpoints with Patient role
- This creates infinite request loop
- Backend correctly denies access but frontend keeps retrying

🛑 Actions taken:
1. ✅ Blocked all API requests temporarily
2. ✅ Will clear all auth data in 1 second
3. ✅ Will redirect to login in 3 seconds

📋 IF THIS DOESN'T WORK:
1. Close ALL browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart browser completely
4. Go to http://localhost:8080/login manually

🔧 DEVELOPER FIX NEEDED:
Frontend routing logic is broken - Patient users should NOT 
try to access admin endpoints like:
- /api/v1/lab/queue
- /api/v1/billing/invoices

Fix the role-based dashboard logic!
`);

// 5. Monitor for continued requests
let checkInterval = setInterval(() => {
    console.log(`📊 Blocked ${blockedRequests} requests so far...`);
    if (blockedRequests > 20) {
        console.log('⚠️ Still blocking many requests - frontend logic needs urgent fix!');
    }
}, 2000);

// Clear interval after 10 seconds
setTimeout(() => {
    clearInterval(checkInterval);
}, 10000);
