// ==UserScript==
// @name         LIOX Protocol v14.1 (Clean Loader)
// @namespace    http://tampermonkey.net/
// @version      14.1
// @description  Manual Auth. Dynamic Branding. Secure Injection.
// @author       Liox
// @match        https://gemini.google.com/*
// @match        https://liox-kernel.dhruvs.host/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const HOST = window.location.hostname;
    const safeEncrypt = (str) => btoa(btoa(str).split('').reverse().join(''));
    const safeDecrypt = (str) => atob(atob(str).split('').reverse().join(''));

    // --- ACTIVATION (Kernel Host) ---
    if (HOST === 'liox-kernel.dhruvs.host') {
        const check = setInterval(() => {
            if (window.location.hash === '#activate') {
                const btn = document.getElementById("liox-activate-btn");
                if (btn && !btn.dataset.bound) {
                    btn.dataset.bound = true;
                    btn.onclick = async () => {
                        try {
                            const response = await fetch('/api/index.php?action=fetch_payload');
                            const data = await response.json();
                            if (data.payload) {
                                const secure = safeEncrypt(atob(data.payload));
                                GM_setValue("LIOX_KERNEL_BLOB", secure);
                                alert("LIOX Activated! Go to Gemini.");
                            }
                        } catch (e) { alert("Error: " + e.message); }
                    };
                }
            }
        }, 500);
        return;
    }

    // --- INJECTION (Gemini) ---
    if (HOST.includes("google.com")) {
        setTimeout(() => {
            const blobData = GM_getValue("LIOX_KERNEL_BLOB", null);
            if (!blobData) { console.log("LIOX LOCKED"); return; }

            try {
                const sourceCode = safeDecrypt(blobData);
                let policy = null;
                if (window.trustedTypes && window.trustedTypes.createPolicy) {
                    try { policy = window.trustedTypes.createPolicy('liox-policy', { createScriptURL: (s) => s }); } catch (e) {}
                }

                const scriptBlob = new Blob([sourceCode], { type: 'text/javascript' });
                const blobUrl = URL.createObjectURL(scriptBlob);
                const finalUrl = policy ? policy.createScriptURL(blobUrl) : blobUrl;

                const script = document.createElement('script');
                script.type = "text/javascript";
                script.src = finalUrl;
                (document.head || document.documentElement).appendChild(script);

                console.log(">>> LIOX KERNEL INJECTED.");
            } catch (e) { console.error("LIOX FAIL:", e); }
        }, 1000);
    }
})();
