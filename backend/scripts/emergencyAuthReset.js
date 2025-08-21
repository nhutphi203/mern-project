// 🚨 EMERGENCY AUTHENTICATION RESET SCRIPT
// Copy and paste this entire script into browser console

console.log('🚨 EMERGENCY AUTHENTICATION RESET STARTING...');

// 1. Stop all network requests to prevent loops
const originalFetch = window.fetch;
window.fetch = function (...args) {
    console.log('🛑 BLOCKED: Network request to', args[0]);
    return Promise.reject('Network requests disabled for reset');
};

// 2. Stop XHR requests
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function () {
    console.log('🛑 BLOCKED: XHR request intercepted');
    return {
        open: () => { },
        send: () => { },
        setRequestHeader: () => { },
        addEventListener: () => { }
    };
};

// 3. Clear ALL storage
try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ CLEARED: Local and session storage');
} catch (e) {
    console.log('⚠️ Storage clear error:', e);
}

// 4. Clear ALL cookies
try {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('✅ CLEARED: All cookies');
} catch (e) {
    console.log('⚠️ Cookie clear error:', e);
}

// 5. Clear IndexedDB if present
try {
    if (window.indexedDB) {
        window.indexedDB.databases().then(databases => {
            databases.forEach(db => {
                window.indexedDB.deleteDatabase(db.name);
                console.log('✅ CLEARED: IndexedDB', db.name);
            });
        });
    }
} catch (e) {
    console.log('⚠️ IndexedDB clear error:', e);
}

// 6. Clear React Query cache if present
try {
    if (window.__REACT_QUERY_CLIENT__) {
        window.__REACT_QUERY_CLIENT__.clear();
        console.log('✅ CLEARED: React Query cache');
    }
} catch (e) {
    console.log('⚠️ React Query clear error:', e);
}

// 7. Reset browser history to remove query params
try {
    if (window.history && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('✅ CLEARED: URL query parameters');
    }
} catch (e) {
    console.log('⚠️ History reset error:', e);
}

// 8. Disable navigation to prevent loops
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;
history.pushState = function (...args) {
    console.log('🛑 BLOCKED: History navigation to', args[2]);
};
history.replaceState = function (...args) {
    console.log('🛑 BLOCKED: History replace to', args[2]);
};

// 9. Override location changes
Object.defineProperty(window, 'location', {
    get: () => window.location,
    set: (value) => {
        console.log('🛑 BLOCKED: Location change to', value);
    }
});

console.log('✅ EMERGENCY RESET COMPLETE');

// 10. Show completion message
const resetMessage = `
🚨 AUTHENTICATION RESET COMPLETED!

✅ CLEARED:
- Local storage (including auth tokens)
- Session storage  
- All cookies
- IndexedDB
- React Query cache
- URL parameters
- Browser history state

🔄 NEXT STEPS:
1. Close this browser tab
2. Close ALL browser tabs 
3. Restart your browser completely
4. Go to: http://localhost:8080/login
5. Login with any test account:
   - patient@hospital.com / password123
   - admin@hospital.com / password123
   - doctor@hospital.com / password123

⚠️ IMPORTANT:
- The "dev@test.com" user was a hardcoded mock
- Frontend bug has been fixed
- Authentication should work normally now

🧪 Test accounts ready:
- Patient: patient@hospital.com / password123
- Admin: admin@hospital.com / password123  
- Doctor: doctor@hospital.com / password123
- Receptionist: nurse@hospital.com / password123
`;

console.log(resetMessage);
alert(resetMessage);

// 11. Attempt to redirect to login after a delay
setTimeout(() => {
    try {
        window.location.href = '/login';
    } catch (e) {
        console.log('Redirect blocked - manually go to /login');
    }
}, 3000);
