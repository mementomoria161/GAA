/* ==========================================================================
   CENTRAL LIFE CYCLE & INTERACTIONS - GAA WEBSITE
   ========================================================================== */

var componentsloaded = 0;
var componentsneeded = 0;

var LOADED = {
    header: {
        init: false,
        func: init_header,
    },
    footer: {
        init: false,
        func: init_footer,
    },
    databanner: {
        init: false,
        func: init_cookies,
    }
};

/**
 * Loads dynamic HTML fragments based on the Bauvolk structure
 */
function load_components(components) {
    componentsneeded = components.length;
    
    for (let i = 0; i < components.length; i++) {
        // Use relative path to support local file loading and dev server setups
        fetchHTML("components/" + components[i] + ".html", components[i]);
    }
}

async function fetchHTML(URL, ID) {
    fetch(URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not fetch component: " + URL);
            }
            return response.text();
        })
        .then(value => {
            loadElement(ID, value);
        })
        .catch(error => {
            console.error("Component load error:", error);
            // Fallback for direct local file browsing if fetch fails (CORS block on file://)
            componentsloaded++;
            if(componentsloaded >= componentsneeded) {
                init();
            }
        });
}

function loadElement(ID, HTML) {
    if (document.readyState === "loading") {
        setTimeout(loadElement, 20, ID, HTML);
    } else {
        const element = document.getElementById(ID);
        if (element) {
            element.innerHTML = HTML;
            LOADED[ID].init = true;
        }
        componentsloaded++;
        if (componentsloaded >= componentsneeded) {
            init();
        }
    }
}

/**
 * Main Initialization Sequence
 */
function init() {
    // Run initializations for components that loaded successfully
    for (let key in LOADED) {
        if (LOADED[key].init) {
            LOADED[key].func();
        }
    }

    init_scroll_effects();
    init_scroll_spy();
    init_timeline();
    init_theory_accordion();
    init_join_form();
    init_scroll_reveal();
    init_hero_effect();
    init_breadcrumb_trail();
}

/* ==========================================================================
   COMPONENT INITIALIZERS
   ========================================================================== */

function init_header() {
    const navToggle = document.getElementById("navToggle");
    const navbarMenu = document.getElementById("navbarMenu");
    const navLinks = document.querySelectorAll(".nav-link");

    const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("/index.html") || window.location.pathname === "" || !window.location.pathname.includes(".html");

    if (isHomePage) {
        // If on the home page, set links to local hash targets for smooth page-scroll
        const brandLink = document.querySelector(".brand");
        if (brandLink) {
            brandLink.setAttribute("href", "#hero");
        }
        const ctaBtn = document.querySelector(".btn-cta");
        if (ctaBtn) {
            ctaBtn.setAttribute("href", "#mitmachen");
        }
        navLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("./#")) {
                link.setAttribute("href", href.substring(2)); // keep only the #hash part
            }
        });
    }

    if (navToggle && navbarMenu) {
        // Mobile Toggle Click Handler
        navToggle.addEventListener("click", () => {
            const isOpen = navbarMenu.classList.toggle("open");
            navToggle.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen);
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navbarMenu.classList.remove("open");
                navToggle.classList.remove("open");
                navToggle.setAttribute("aria-expanded", false);
            });
        });
        
        // Also close menu when clicking CTA
        const ctaBtn = navbarMenu.querySelector(".btn-cta");
        if (ctaBtn) {
            ctaBtn.addEventListener("click", () => {
                navbarMenu.classList.remove("open");
                navToggle.classList.remove("open");
                navToggle.setAttribute("aria-expanded", false);
            });
        }
    }
}

function init_footer() {
    // Left empty to allow normal navigation to impressum.html and datenschutz.html
}

function init_cookies() {
    const consent = localStorage.getItem("gaa_cookies");
    const databanner = document.getElementById("databanner");
    
    if (consent === null && databanner) {
        databanner.style.display = "block";
    }
}

function cookies(choice) {
    localStorage.setItem("gaa_cookies", choice);
    const databanner = document.getElementById("databanner");
    if (databanner) {
        databanner.style.display = "none";
    }
}

/* ==========================================================================
   PAGE SCROLL & SCROLL SPY
   ========================================================================== */

function init_scroll_effects() {
    const header = document.getElementById("header");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

function init_scroll_spy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px", // Focus middle viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                navLinks.forEach(link => {
                    const href = link.getAttribute("href");
                    if (href === `#${id}`) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   INTERACTIVE TIMELINE (STRATEGY)
   ========================================================================== */

function init_timeline() {
    const timelineItems = document.querySelectorAll(".timeline-item");
    const progressLine = document.querySelector(".timeline-progress");

    timelineItems.forEach((item, index) => {
        const node = item.querySelector(".timeline-node");
        
        if (node) {
            node.addEventListener("click", () => {
                // Remove active from all
                timelineItems.forEach(t => t.classList.remove("active"));
                
                // Add active to selected
                item.classList.add("active");
                
                // Adjust vertical bar progression height percentage
                if (progressLine) {
                    const progressHeight = ((index + 1) / timelineItems.length) * 100;
                    progressLine.style.height = `${progressHeight}%`;
                }
            });
        }
    });
}

/* ==========================================================================
   THEORY DEEP DIVE ACCORDION
   ========================================================================== */

function init_theory_accordion() {
    const headers = document.querySelectorAll(".accordion-header");

    headers.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = item.querySelector(".accordion-content");
            const isOpen = item.classList.contains("open");

            // Close all items
            document.querySelectorAll(".accordion-item").forEach(acc => {
                acc.classList.remove("open");
                const body = acc.querySelector(".accordion-content");
                if (body) body.style.maxHeight = null;
            });

            // Toggle selected item
            if (!isOpen && content) {
                item.classList.add("open");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

/* ==========================================================================
   SCROLL REVEAL EFFECT
   ========================================================================== */

function init_scroll_reveal() {
    const revealElements = document.querySelectorAll(".reveal");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   PARTICIPATION FORM HANDLER
   ========================================================================== */

function init_join_form() {
    const form = document.getElementById("joinForm");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            // Basic values capture
            const nameInput = document.getElementById("formName");
            const emailInput = document.getElementById("formEmail");
            const stadtInput = document.getElementById("formStadt");
            const messageInput = document.getElementById("formMessage");
            const acceptPrivacyInput = document.getElementById("formAcceptPrivacy");
            const submitBtn = form.querySelector(".btn-form-submit");

            // Frontend validation
            if (!nameInput.value.trim() || !emailInput.value.trim() || !stadtInput.value.trim()) {
                alert("Bitte füllen Sie Name, E-Mail und Stadt aus.");
                return;
            }

            if (!acceptPrivacyInput || !acceptPrivacyInput.checked) {
                alert("Bitte lesen und akzeptieren Sie die Datenschutzerklärung.");
                return;
            }

            // Change button text and disable it to prevent double submissions
            submitBtn.textContent = "Wird gesendet...";
            submitBtn.disabled = true;

            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                stadt: stadtInput.value.trim(),
                message: messageInput ? messageInput.value.trim() : "",
                _subject: "Neue Mitgliedschaftsanfrage - GAA Assoziation",
                _captcha: "false",
                _template: "table"
            };

            // Capture honeypot if exists
            const honeyInput = form.querySelector('input[name="_honey"]');
            if (honeyInput && honeyInput.value) {
                formData["_honey"] = honeyInput.value;
            }

            fetch("https://formsubmit.co/ajax/niki.mitlaender@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Form submission failed");
                }
            })
            .then(data => {
                const formContainer = document.getElementById("formContainer");
                if (formContainer) {
                    formContainer.innerHTML = `
                        <div class="success-overlay">
                            <div class="success-icon">✓</div>
                            <h2 class="success-title text-ultra-bold">Willkommen Genoss*in!</h2>
                            <p class="success-message">
                                Vielen Dank für dein Interesse an der Assoziation. Deine Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei dir melden!
                            </p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error("Error submitting form:", error);
                alert("Es gab ein Problem beim Senden des Formulars. Bitte versuche es später noch einmal oder wende dich direkt per Mail an uns.");
                submitBtn.textContent = "Mitglied werden";
                submitBtn.disabled = false;
            });
        });
    }
}

/**
 * Escapes strings to prevent HTML injection
 */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   INTERACTIVE CANVAS PARTICLE NETWORK EFFECT
   ========================================================================== */

function init_hero_effect() {
    const canvas = document.getElementById("networkCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const baseParticles = [];
    const baseFaces = [];
    
    // Perpendicular vectors for hammer coordinates (tilted bottom-right to top-left, rotated steeper clockwise around head)
    const vnorm = { x: -0.788, y: 0.616 };
    const unorm = { x: -0.616, y: -0.788 };

    // Performance detection to adjust polygon resolution dynamically
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    
    // Quality settings (rings R, segments S, etc.)
    let hh_R, hh_S, hhead_R, hhead_S, sb_M, sb_N, sh_R, sh_S;
    
    if (!isMobile && cores >= 8) {
        // High Performance (Power desktops/laptops)
        hh_R = 12;
        hh_S = 6;
        hhead_R = 12;
        hhead_S = 4; // Must be exactly 4 (due to rectangular corners array and end-cap indices)
        sb_M = 24;
        sb_N = 4;
        sh_R = 10;
        sh_S = 6;
        console.log("GAA Canvas Quality: HIGH (" + cores + " cores, desktop)");
    } else if (isMobile || cores <= 2) {
        // Low Performance (Mobile or dual-core desktops)
        hh_R = 6;
        hh_S = 3;
        hhead_R = 6;
        hhead_S = 4; // Must be exactly 4
        sb_M = 12;
        sb_N = 2;
        sh_R = 4;
        sh_S = 3;
        console.log("GAA Canvas Quality: LOW (mobile or low-end device)");
    } else {
        // Medium / Standard Performance
        hh_R = 8;
        hh_S = 4;
        hhead_R = 8;
        hhead_S = 4;
        sb_M = 16;
        sb_N = 3;
        sh_R = 6;
        sh_S = 4;
        console.log("GAA Canvas Quality: MEDIUM (standard desktop/laptop)");
    }

    // 1. Hammer Handle (R = rings, S = segments per ring)
    const hh_offset = baseParticles.length;
    for (let k = 0; k < hh_R; k++) {
        const t = k / (hh_R - 1);
        const xLine = 0.543 - t * 0.567;
        const yLine = 0.774 - t * 0.725; // rotated steeper clockwise around head, base moved down-left, handle made shorter
        
        const r = 0.022;
        for (let j = 0; j < hh_S; j++) {
            const theta = (j * 2 * Math.PI) / hh_S;
            const x0 = xLine + r * Math.cos(theta) * vnorm.x;
            const y0 = yLine + r * Math.cos(theta) * vnorm.y;
            const z0 = r * Math.sin(theta);
            
            baseParticles.push({ x0: x0, y0: y0, z0: z0, color: '#F6BAFF' });
        }
    }
    // Generate Hammer Handle Faces
    for (let k = 0; k < hh_R - 1; k++) {
        for (let j = 0; j < hh_S; j++) {
            const v0 = hh_offset + k * hh_S + j;
            const v1 = hh_offset + k * hh_S + (j + 1) % hh_S;
            const v2 = hh_offset + (k + 1) * hh_S + (j + 1) % hh_S;
            const v3 = hh_offset + (k + 1) * hh_S + j;
            baseFaces.push({ indices: [v0, v1, v2, v3], color: '#F6BAFF' });
        }
    }

    // 2. Hammer Head (R = 8 slices, S = 4 segments per slice -> 32 vertices)
    const hhead_offset = baseParticles.length;
    const hhead_vnorm = { x: 0.788, y: -0.616 }; 
    const hhead_unorm = { x: -0.616, y: -0.788 }; 
    
    for (let k = 0; k < hhead_R; k++) {
        const t = k / (hhead_R - 1);
        const lenOffset = -0.19 + t * 0.38;
        const xLine = -0.024 + lenOffset * hhead_vnorm.x;
        const yLine = 0.049 + lenOffset * hhead_vnorm.y; // Centered in the sickle mouth
        
        const w_off = 0.07;
        const h_off = 0.07;
        
        const corners = [
            { cx: w_off, cy: h_off },
            { cx: -w_off, cy: h_off },
            { cx: -w_off, cy: -h_off },
            { cx: w_off, cy: -h_off }
        ];
        
        for (let j = 0; j < hhead_S; j++) {
            const x0 = xLine + corners[j].cx * hhead_unorm.x;
            const y0 = yLine + corners[j].cx * hhead_unorm.y;
            const z0 = corners[j].cy;
            
            const color = Math.random() > 0.35 ? '#F6BAFF' : '#F79B06';
            baseParticles.push({ x0: x0, y0: y0, z0: z0, color: color });
        }
    }
    // Generate Hammer Head Faces
    for (let k = 0; k < hhead_R - 1; k++) {
        for (let j = 0; j < hhead_S; j++) {
            const v0 = hhead_offset + k * hhead_S + j;
            const v1 = hhead_offset + k * hhead_S + (j + 1) % hhead_S;
            const v2 = hhead_offset + (k + 1) * hhead_S + (j + 1) % hhead_S;
            const v3 = hhead_offset + (k + 1) * hhead_S + j;
            baseFaces.push({ indices: [v0, v1, v2, v3], color: '#F6BAFF' });
        }
    }
    // Add end caps for the Hammer Head
    baseFaces.push({
        indices: [hhead_offset, hhead_offset + 3, hhead_offset + 2, hhead_offset + 1],
        color: '#F6BAFF'
    });
    baseFaces.push({
        indices: [
            hhead_offset + (hhead_R - 1) * hhead_S,
            hhead_offset + (hhead_R - 1) * hhead_S + 1,
            hhead_offset + (hhead_R - 1) * hhead_S + 2,
            hhead_offset + (hhead_R - 1) * hhead_S + 3
        ],
        color: '#F6BAFF'
    });

    // 3. Sickle Blade (M = 16 steps along arc, N = 3 steps across width, 2 layers -> 96 vertices)
    const sb_offset = baseParticles.length;
    const alphaStart = 0.72 * Math.PI;
    const alphaEnd = -0.82 * Math.PI; // Sweeps clockwise from bottom-left to top-left
    const zLayers = [0.03, -0.03];
    
    for (let l = 0; l < 2; l++) {
        const zVal = zLayers[l];
        for (let i = 0; i < sb_M; i++) {
            const t = i / (sb_M - 1);
            const alpha = alphaStart + t * (alphaEnd - alphaStart);
            
            const rInner = 0.33 + 0.10 * t;
            const rOuter = 0.45 + 0.14 * Math.sin(t * Math.PI) - 0.03 * t;
            
            for (let j = 0; j < sb_N; j++) {
                const w = j / (sb_N - 1);
                const r = rInner + w * (rOuter - rInner);
                
                const x0 = -0.05 + r * Math.cos(alpha);
                const y0 = 0.05 + r * Math.sin(alpha);
                const z0 = zVal;
                
                const color = j === sb_N - 1 ? '#F79B06' : (Math.random() > 0.25 ? '#F6BAFF' : '#F79B06');
                baseParticles.push({ x0: x0, y0: y0, z0: z0, color: color });
            }
        }
    }
    const layerSize = sb_M * sb_N;
    // Generate Front & Back Faces
    for (let i = 0; i < sb_M - 1; i++) {
        for (let j = 0; j < sb_N - 1; j++) {
            const f0 = sb_offset + i * sb_N + j;
            const f1 = sb_offset + i * sb_N + j + 1;
            const f2 = sb_offset + (i + 1) * sb_N + j + 1;
            const f3 = sb_offset + (i + 1) * sb_N + j;
            baseFaces.push({ indices: [f0, f1, f2, f3], color: '#F6BAFF' });
            
            const b0 = sb_offset + layerSize + i * sb_N + j;
            const b1 = sb_offset + layerSize + (i + 1) * sb_N + j;
            const b2 = sb_offset + layerSize + (i + 1) * sb_N + j + 1;
            const b3 = sb_offset + layerSize + i * sb_N + j + 1;
            baseFaces.push({ indices: [b0, b1, b2, b3], color: '#F6BAFF' });
        }
    }
    // Generate Side Edge Faces
    for (let i = 0; i < sb_M - 1; i++) {
        // Inner Edge (j = 0)
        const i_f0 = sb_offset + i * sb_N;
        const i_f1 = sb_offset + (i + 1) * sb_N;
        const i_b1 = sb_offset + layerSize + (i + 1) * sb_N;
        const i_b0 = sb_offset + layerSize + i * sb_N;
        baseFaces.push({ indices: [i_f0, i_f1, i_b1, i_b0], color: '#F6BAFF' });
        
        // Outer Edge (j = N - 1)
        const o_f0 = sb_offset + i * sb_N + (sb_N - 1);
        const o_b0 = sb_offset + layerSize + i * sb_N + (sb_N - 1);
        const o_b1 = sb_offset + layerSize + (i + 1) * sb_N + (sb_N - 1);
        const o_f1 = sb_offset + (i + 1) * sb_N + (sb_N - 1);
        baseFaces.push({ indices: [o_f0, o_b0, o_b1, o_f1], color: '#F79B06' });
    }
    // Generate End Cap Faces (Base and Tip)
    for (let j = 0; j < sb_N - 1; j++) {
        const base_f0 = sb_offset + j;
        const base_b0 = sb_offset + layerSize + j;
        const base_b1 = sb_offset + layerSize + j + 1;
        const base_f1 = sb_offset + j + 1;
        baseFaces.push({ indices: [base_f0, base_b0, base_b1, base_f1], color: '#F6BAFF' });
        
        const tip_f0 = sb_offset + (sb_M - 1) * sb_N + j;
        const tip_f1 = sb_offset + (sb_M - 1) * sb_N + j + 1;
        const tip_b1 = sb_offset + layerSize + (sb_M - 1) * sb_N + j + 1;
        const tip_b0 = sb_offset + layerSize + (sb_M - 1) * sb_N + j;
        baseFaces.push({ indices: [tip_f0, tip_f1, tip_b1, tip_b0], color: '#F6BAFF' });
    }

    // 4. Sickle Handle (R = 6 rings, S = 4 segments per ring -> 24 vertices)
    const sh_offset = baseParticles.length;
    const sh_vnorm = { x: 0.707, y: 0.707 }; // Perpendicular frame for handle tilted bottom-left to top-right
    
    for (let k = 0; k < sh_R; k++) {
        const t = k / (sh_R - 1);
        const xLine = -0.54 + t * 0.24;
        const yLine = 0.59 - t * 0.24; // bottom-left to top-right, connects perfectly to blade base
        
        const r = 0.03;
        for (let j = 0; j < sh_S; j++) {
            const theta = (j * 2 * Math.PI) / sh_S;
            const x0 = xLine + r * Math.cos(theta) * sh_vnorm.x;
            const y0 = yLine + r * Math.cos(theta) * sh_vnorm.y;
            const z0 = r * Math.sin(theta);
            
            baseParticles.push({ x0: x0, y0: y0, z0: z0, color: '#F6BAFF' });
        }
    }
    // Generate Sickle Handle Faces
    for (let k = 0; k < sh_R - 1; k++) {
        for (let j = 0; j < sh_S; j++) {
            const v0 = sh_offset + k * sh_S + j;
            const v1 = sh_offset + k * sh_S + (j + 1) % sh_S;
            const v2 = sh_offset + (k + 1) * sh_S + (j + 1) % sh_S;
            const v3 = sh_offset + (k + 1) * sh_S + j;
            baseFaces.push({ indices: [v0, v1, v2, v3], color: '#F6BAFF' });
        }
    }

    const mouse = {
        x: null,
        y: null,
        radius: 160,
        active: false
    };

    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
            mouse.x = mouseX;
            mouse.y = mouseY;
            mouse.active = true;
        } else {
            mouse.active = false;
        }
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
        mouse.active = false;
    });

    // Pre-allocate arrays and objects to avoid GC overhead
    const projected = [];
    for (let i = 0; i < baseParticles.length; i++) {
        projected.push({ x: 0, y: 0, z: 0, scale: 0, color: baseParticles[i].color });
    }

    const facesWithDepth = [];
    for (let i = 0; i < baseFaces.length; i++) {
        facesWithDepth.push({ indices: baseFaces[i].indices, avgZ: 0, avgScale: 0, color: baseFaces[i].color });
    }

    // Bucket arrays pre-allocated
    const bucketBackFaces = [];
    const bucketMidFaces = [];
    const bucketFrontFaces = [];
    
    const bucketBackParticles = [];
    const bucketMidParticles = [];
    const bucketFrontParticles = [];

    let angleX = 0;
    let angleY = 0;
    let time = 0;
    let animationFrameId = null;
    let isCanvasVisible = true;

    function getBucketParams(scale) {
        const isMobile = window.innerWidth <= 768;
        const alpha = Math.max(0.02, Math.min(0.24, (scale - 0.5) * 0.14));
        const thicknessMultiplier = isMobile ? 2.5 : 1.0;
        return {
            fillStyle: `rgba(76, 29, 159, ${alpha * 0.45})`,
            strokeStyleOrange: `rgba(247, 155, 6, ${alpha * (isMobile ? 1.8 : 1.35)})`,
            strokeStylePurple: `rgba(246, 186, 255, ${alpha * (isMobile ? 1.8 : 1.35)})`,
            lineWidth: 0.5 * scale * thicknessMultiplier,
            particleAlpha: Math.max(0.12, Math.min(0.8, (scale - 0.4) * 0.45))
        };
    }

    function animate() {
        if (!isCanvasVisible) {
            animationFrameId = null;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        angleY += 0.0006;
        angleX = 0.15 * Math.sin(time * 0.004);
        time += 0.25;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const isMobile = window.innerWidth <= 768;
        const baseRadius = Math.min(canvas.width, canvas.height) * (isMobile ? 0.85 : 0.60);
        const waveAmp = baseRadius * 0.025;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        // Project and morph vertices
        const mouseRadiusSq = mouse.radius * mouse.radius;
        for (let i = 0; i < baseParticles.length; i++) {
            const p = baseParticles[i];

            // Initialize dynamic physics offsets on the first frame
            if (p.offX === undefined) {
                p.offX = 0;
                p.offY = 0;
                p.vx = 0;
                p.vy = 0;
                // Randomized properties to create a scattered, natural dispersion
                p.sensitivity = 0.4 + Math.random() * 1.4; // 0.4 to 1.8
                p.spring = 0.012 + Math.random() * 0.008;   // 0.012 to 0.020
                p.damping = 0.65 + Math.random() * 0.10;    // 0.65 to 0.75 (high friction to prevent overshoot)
            }

            const morphFactor = Math.sin(3.5 * p.x0 + time * 0.012) * Math.cos(3.5 * p.y0 - time * 0.01);
            const radius = baseRadius + waveAmp * morphFactor;

            const x3d = p.x0 * radius;
            const y3d = p.y0 * radius;
            const z3d = p.z0 * radius;

            const xRotY = x3d * cosY - z3d * sinY;
            const zRotY = x3d * sinY + z3d * cosY;

            const yRotX = y3d * cosX - zRotY * sinX;
            const zRotX = y3d * sinX + zRotY * cosX;

            const d = baseRadius * 2.2;
            const scaleFactor = d / (d + zRotX);

            let baseScreenX = centerX + xRotY * scaleFactor;
            let baseScreenY = centerY + yRotX * scaleFactor;

            // Apply spring pull back to base position
            p.vx -= p.offX * p.spring;
            p.vy -= p.offY * p.spring;

            // Apply mouse repulsion force (optimized with squared distance check first)
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const currentScreenX = baseScreenX + p.offX;
                const currentScreenY = baseScreenY + p.offY;
                const dx = currentScreenX - mouse.x;
                const dy = currentScreenY - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouseRadiusSq && distSq > 0.01) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / mouse.radius);
                    p.vx += (dx / dist) * force * force * 2.2 * p.sensitivity;
                    p.vy += (dy / dist) * force * force * 2.2 * p.sensitivity;
                }
            }

            // Apply friction/damping
            p.vx *= p.damping;
            p.vy *= p.damping;

            // Update offsets
            p.offX += p.vx;
            p.offY += p.vy;

            // Update projected array in place
            const proj = projected[i];
            proj.x = baseScreenX + p.offX;
            proj.y = baseScreenY + p.offY;
            proj.z = zRotX;
            proj.scale = scaleFactor;
        }

        // Calculate face depth values in place
        for (let i = 0; i < baseFaces.length; i++) {
            const f = baseFaces[i];
            const faceDepth = facesWithDepth[i];
            const p0 = projected[f.indices[0]];
            const p1 = projected[f.indices[1]];
            const p2 = projected[f.indices[2]];
            const p3 = projected[f.indices[3]];

            faceDepth.avgZ = (p0.z + p1.z + p2.z + p3.z) * 0.25;
            faceDepth.avgScale = (p0.scale + p1.scale + p2.scale + p3.scale) * 0.25;
        }

        // Clear bucket arrays (without reallocation)
        bucketBackFaces.length = 0;
        bucketMidFaces.length = 0;
        bucketFrontFaces.length = 0;

        bucketBackParticles.length = 0;
        bucketMidParticles.length = 0;
        bucketFrontParticles.length = 0;

        // Bucket faces based on depth (no sorting required!)
        for (let i = 0; i < facesWithDepth.length; i++) {
            const f = facesWithDepth[i];
            const scale = f.avgScale;
            if (scale < 0.9) {
                bucketBackFaces.push(f);
            } else if (scale < 1.25) {
                bucketMidFaces.push(f);
            } else {
                bucketFrontFaces.push(f);
            }
        }

        // Bucket particles based on depth
        for (let i = 0; i < projected.length; i++) {
            const p = projected[i];
            const scale = p.scale;
            if (scale < 0.9) {
                bucketBackParticles.push(p);
            } else if (scale < 1.25) {
                bucketMidParticles.push(p);
            } else {
                bucketFrontParticles.push(p);
            }
        }

        // Draw depth layers (Back -> Mid -> Front)
        const layers = [
            { faces: bucketBackFaces, particles: bucketBackParticles, scale: 0.8 },
            { faces: bucketMidFaces, particles: bucketMidParticles, scale: 1.05 },
            { faces: bucketFrontFaces, particles: bucketFrontParticles, scale: 1.4 }
        ];

        for (let l = 0; l < 3; l++) {
            const layer = layers[l];
            const faces = layer.faces;
            const particles = layer.particles;
            if (faces.length === 0 && particles.length === 0) continue;

            const params = getBucketParams(layer.scale);

            // 1. Draw layer faces (Fills)
            if (faces.length > 0) {
                ctx.beginPath();
                for (let i = 0; i < faces.length; i++) {
                    const f = faces[i];
                    const p0 = projected[f.indices[0]];
                    const p1 = projected[f.indices[1]];
                    const p2 = projected[f.indices[2]];
                    const p3 = projected[f.indices[3]];
                    ctx.moveTo(p0.x, p0.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                }
                ctx.fillStyle = params.fillStyle;
                ctx.fill();

                // 2. Draw layer faces (Orange Strokes)
                ctx.beginPath();
                let hasOrangeStrokes = false;
                for (let i = 0; i < faces.length; i++) {
                    const f = faces[i];
                    if (f.color === '#F79B06') {
                        hasOrangeStrokes = true;
                        const p0 = projected[f.indices[0]];
                        const p1 = projected[f.indices[1]];
                        const p2 = projected[f.indices[2]];
                        const p3 = projected[f.indices[3]];
                        ctx.moveTo(p0.x, p0.y);
                        ctx.lineTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y);
                        ctx.closePath();
                    }
                }
                if (hasOrangeStrokes) {
                    ctx.strokeStyle = params.strokeStyleOrange;
                    ctx.lineWidth = params.lineWidth;
                    ctx.stroke();
                }

                // 3. Draw layer faces (Purple/Pink Strokes)
                ctx.beginPath();
                let hasPurpleStrokes = false;
                for (let i = 0; i < faces.length; i++) {
                    const f = faces[i];
                    if (f.color !== '#F79B06') {
                        hasPurpleStrokes = true;
                        const p0 = projected[f.indices[0]];
                        const p1 = projected[f.indices[1]];
                        const p2 = projected[f.indices[2]];
                        const p3 = projected[f.indices[3]];
                        ctx.moveTo(p0.x, p0.y);
                        ctx.lineTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y);
                        ctx.closePath();
                    }
                }
                if (hasPurpleStrokes) {
                    ctx.strokeStyle = params.strokeStylePurple;
                    ctx.lineWidth = params.lineWidth;
                    ctx.stroke();
                }
            }

            // 4. Draw layer particles (Orange Fills)
            if (particles.length > 0) {
                ctx.beginPath();
                let hasOrangeParticles = false;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    if (p.color === '#F79B06') {
                        hasOrangeParticles = true;
                        const size = 0.95 * p.scale * (isMobile ? 1.8 : 1.0);
                        ctx.moveTo(p.x + size, p.y);
                        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    }
                }
                if (hasOrangeParticles) {
                    ctx.fillStyle = `rgba(247, 155, 6, ${params.particleAlpha * 1.2})`;
                    ctx.fill();
                }

                // 5. Draw layer particles (Purple/Pink Fills)
                ctx.beginPath();
                let hasPurpleParticles = false;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    if (p.color !== '#F79B06') {
                        hasPurpleParticles = true;
                        const size = 0.65 * p.scale * (isMobile ? 1.8 : 1.0);
                        ctx.moveTo(p.x + size, p.y);
                        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    }
                }
                if (hasPurpleParticles) {
                    ctx.fillStyle = `rgba(246, 186, 255, ${params.particleAlpha * 1.2})`;
                    ctx.fill();
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Set up IntersectionObserver to pause when the canvas is off-screen
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isCanvasVisible = entry.isIntersecting;
            if (isCanvasVisible) {
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(animate);
                }
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });
    }, { threshold: 0.01 });
    observer.observe(canvas);
}

/* ==========================================================================
   SCROLL BREADCRUMB TRAIL PROGRESS
   ========================================================================== */

function init_breadcrumb_trail() {
    const activeLine = document.getElementById("activeBreadcrumbLine");
    if (!activeLine) return;

    function updateTrail() {
        const scrollStart = window.innerHeight; // Height of the Hero section
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        const scrollableDistance = documentHeight - scrollStart - viewportHeight;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        const relativeScroll = currentScroll - (scrollStart - 300); // Start drawing slightly early
        
        if (relativeScroll < 0) {
            activeLine.style.height = "0%";
            return;
        }
        
        const offsetScrollable = scrollableDistance + 300;
        let percentage = (relativeScroll / offsetScrollable) * 100;
        if (percentage > 100) percentage = 100;
        
        activeLine.style.height = `${percentage}%`;
    }

    window.addEventListener("scroll", updateTrail);
    window.addEventListener("resize", updateTrail);
    updateTrail(); // Initial call
}
