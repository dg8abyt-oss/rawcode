// ==UserScript==
// @name         LIOX Protocol v15.6 Production
// @namespace    http://tampermonkey.net/
// @version      15.6
// @description  Connects to api/index.php. Auto-binds button.
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
    // ACTIVATION LOGIC (liox-kernel)
    // ==========================================================
    if (HOST === 'liox-kernel.dhruvs.host') {
        
        // 1. First Run Redirect
        const setupComplete = GM_getValue("liox_setup_complete", false);
        if (!setupComplete && window.location.hash !== '#activate') {
            GM_setValue("liox_setup_complete", true);
            window.location.href = window.location.origin + "/#activate";
            return;
        }

        // 2. Button Binder (Aggressive Check)
        function bindButton() {
            const btn = document.getElementById("liox-activate-btn");
            const dot = document.getElementById("script-dot");
            const msg = document.getElementById("script-msg");

            if (btn && !btn.dataset.bound) {
                // VISUAL CONFIRMATION - This makes the button GREEN
                btn.dataset.bound = true;
                btn.style.background = "#2ea44f"; 
                btn.style.cursor = "pointer";
                btn.textContent = "ESTABLISH CONNECTION";
                
                if(dot) { dot.style.background = "#2ea44f"; dot.style.boxShadow = "0 0 10px #2ea44f"; }
                if(msg) msg.textContent = "Script Ready & Waiting";

                // CLICK HANDLER
                btn.onclick = async () => {
                    if(msg) msg.textContent = "Fetching Payload...";
                    
                    try {
                        // FETCH FROM PHP
                        const response = await fetch('/api/index.php?action=fetch_payload');
                        
                        // Check if it's actually JSON (Vercel PHP check)
                        const contentType = response.headers.get("content-type");
                        if (!contentType || !contentType.includes("application/json")) {
                            throw new Error("Server Error: PHP not executing (Check vercel.json)");
                        }

                        if (!response.ok) throw new Error("Gateway Error: " + response.status);
                        const data = await response.json();
                        
                        if (data.payload) {
                            const secure = safeEncrypt(atob(data.payload));
                            GM_setValue("LIOX_KERNEL_BLOB", secure);
                            
                            btn.textContent = "INSTALLED";
                            if(msg) { msg.textContent = "✅ Kernel Installed. Open Gemini."; msg.style.color = "#2ea44f"; }
                            alert("LIOX Activated! You can now use Gemini.");
                        }
                    } catch (e) { 
                        if(msg) { msg.textContent = "Error: " + e.message; msg.style.color = "#f85149"; }
                        console.error(e);
                    }
                };
            }
        }

        // Check constantly in case DOM loads slow
        setInterval(bindButton, 500);
        return;
    }

    // ==========================================================
    // INJECTION LOGIC (Gemini)
    // ==========================================================
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
            } catch (e) { console.error("LIOX FAIL:", e); }
        }, 1000);
    }
})();
