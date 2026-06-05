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

    // 1. Hammer Handle (R = 12 rings, S = 6 segments per ring -> 72 vertices)
    const hh_R = 12;
    const hh_S = 6;
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

    // 2. Hammer Head (R = 12 slices, S = 4 segments per slice -> 48 vertices)
    const hhead_R = 12;
    const hhead_S = 4;
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

    // 3. Sickle Blade (M = 24 steps along arc, N = 5 steps across width, 2 layers -> 240 vertices)
    const sb_M = 24;
    const sb_N = 5;
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

    // 4. Sickle Handle (R = 10 rings, S = 6 segments per ring -> 60 vertices)
    const sh_R = 10;
    const sh_S = 6;
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

    let angleX = 0;
    let angleY = 0;
    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        angleY += 0.0006;
        angleX = 0.15 * Math.sin(time * 0.004);
        time += 0.25;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const baseRadius = Math.min(canvas.width, canvas.height) * 0.60;
        const waveAmp = baseRadius * 0.025;

            const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const projected = [];

        // Project and morph vertices
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

            // Apply mouse repulsion force
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const currentScreenX = baseScreenX + p.offX;
                const currentScreenY = baseScreenY + p.offY;
                const dx = currentScreenX - mouse.x;
                const dy = currentScreenY - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius && dist > 0.1) {
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

            let screenX = baseScreenX + p.offX;
            let screenY = baseScreenY + p.offY;

            projected.push({
                x: screenX,
                y: screenY,
                z: zRotX,
                scale: scaleFactor,
                color: p.color
            });
        }

        // Depth-sort faces back-to-front (Painter's Algorithm)
        const facesWithDepth = [];
        for (let i = 0; i < baseFaces.length; i++) {
            const f = baseFaces[i];
            const p0 = projected[f.indices[0]];
            const p1 = projected[f.indices[1]];
            const p2 = projected[f.indices[2]];
            const p3 = projected[f.indices[3]];

            const avgZ = (p0.z + p1.z + p2.z + p3.z) / 4;
            const avgScale = (p0.scale + p1.scale + p2.scale + p3.scale) / 4;

            facesWithDepth.push({
                indices: f.indices,
                avgZ: avgZ,
                avgScale: avgScale,
                color: f.color
            });
        }
        facesWithDepth.sort((a, b) => b.avgZ - a.avgZ);

        // Draw faces
        for (let i = 0; i < facesWithDepth.length; i++) {
            const f = facesWithDepth[i];
            const p0 = projected[f.indices[0]];
            const p1 = projected[f.indices[1]];
            const p2 = projected[f.indices[2]];
            const p3 = projected[f.indices[3]];

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();

            const alpha = Math.max(0.02, Math.min(0.24, (f.avgScale - 0.5) * 0.14));

            // Translucent deep purple facet surface fill
            ctx.fillStyle = `rgba(76, 29, 159, ${alpha * 0.45})`;
            ctx.fill();

            // Glowing wireframe edges
            ctx.strokeStyle = f.color === '#F79B06' 
                ? `rgba(247, 155, 6, ${alpha * 1.35})` 
                : `rgba(246, 186, 255, ${alpha * 1.35})`;
            ctx.lineWidth = 0.5 * f.avgScale;
            ctx.stroke();
        }

        // Draw coordinate particles on top
        for (let i = 0; i < projected.length; i++) {
            const p = projected[i];
            const baseSize = p.color === '#F79B06' ? 0.95 : 0.65;
            const size = baseSize * p.scale;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            
            const alpha = Math.max(0.12, Math.min(0.8, (p.scale - 0.4) * 0.45));
            if (p.color === '#F79B06') {
                ctx.fillStyle = `rgba(247, 155, 6, ${alpha * 1.2})`;
            } else {
                ctx.fillStyle = `rgba(246, 186, 255, ${alpha * 1.2})`;
            }
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
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
