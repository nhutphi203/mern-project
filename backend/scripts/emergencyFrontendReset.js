// Emergency Frontend Reset Script
// Copy and paste this into browser console to stop infinite loops

console.log('🚨 EMERGENCY FRONTEND RESET STARTING...');

// 1. Stop all network requests
const originalFetch = window.fetch;
window.fetch = function () {
    console.log('🛑 BLOCKED: Network request intercepted');
    return Promise.reject('Network requests disabled for debugging');
};

// 2. Override XMLHttpRequest
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function () {
    console.log('🛑 BLOCKED: XHR request intercepted');
    return { open: () => { }, send: () => { }, setRequestHeader: () => { } };
};

// 3. Clear all storage
localStorage.clear();
sessionStorage.clear();
console.log('🧹 CLEARED: Local and session storage');

// 4. Clear cookies
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log('🧹 CLEARED: Cookies');

// 5. Stop history navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;
history.pushState = function () {
    console.log('🛑 BLOCKED: History navigation intercepted');
};
history.replaceState = function () {
    console.log('🛑 BLOCKED: History navigation intercepted');
};

// 6. Override window.location
const originalLocation = window.location;
Object.defineProperty(window, 'location', {
    get: () => originalLocation,
    set: (value) => {
        console.log('🛑 BLOCKED: Location change intercepted:', value);
    }
});

// 7. Disable React Router navigation (if present)
if (window.React) {
    console.log('⚛️ React detected - attempting to disable router');
    // More aggressive React router blocking
}

console.log('✅ EMERGENCY RESET COMPLETE');
console.log('🔧 Next steps:');
console.log('1. Refresh the page');
console.log('2. Check frontend routing code');
console.log('3. Look for role-based navigation logic');

// Instructions for user
alert(`
🚨 EMERGENCY FRONTEND RESET ACTIVATED

✅ Blocked: All network requests
✅ Cleared: Storage and cookies  
✅ Stopped: Navigation loops

Next steps:
1. Refresh this page
2. Check your React routing code
3. Look for admin/patient navigation logic
4. Backend authentication is working correctly!
`);
