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
    // Connect legal links if pages exist or intercept with modal/notices
    const linkImpressum = document.getElementById("linkImpressum");
    const linkDatenschutz = document.getElementById("linkDatenschutz");

    if (linkImpressum) {
        linkImpressum.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Impressum:\n\nGemeinwirtschaftliche Arbeitenden-Assoziation (GAA)\nVerein in Gründung\nE-Mail: info@gaa-assoziation.de\nStand: Mai 2026");
        });
    }

    if (linkDatenschutz) {
        linkDatenschutz.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Datenschutzerklärung:\n\nWir speichern personenbezogene Daten (Name, E-Mail) ausschließlich zum Zwecke der Kontaktaufnahme auf Grundlage Ihrer Einwilligung. Es werden keine Daten an Dritte weitergegeben.");
        });
    }
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
    const container = document.getElementById("formContainer");

    if (form && container) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Basic values capture
            const nameInput = document.getElementById("formName");
            const emailInput = document.getElementById("formEmail");
            const stadtInput = document.getElementById("formStadt");
            const messageInput = document.getElementById("formMessage");
            const submitBtn = form.querySelector(".btn-form-submit");

            // Frontend validation
            if (!nameInput.value.trim() || !emailInput.value.trim() || !stadtInput.value.trim()) {
                alert("Bitte füllen Sie Name, E-Mail und Stadt aus.");
                return;
            }

            // Animate submission state on CTA button
            submitBtn.disabled = true;
            submitBtn.textContent = "Verbindung wird aufgebaut...";
            
            // Mock API delay (1.5 seconds)
            setTimeout(() => {
                // Fade out current form and display custom visual confirmation state
                form.style.display = "none";
                
                const successContent = `
                    <div class="success-overlay">
                        <div class="success-icon">&check;</div>
                        <h3 class="success-title">Willkommen Genosse!</h3>
                        <p class="success-message">
                            Vielen Dank, <strong>${escapeHTML(nameInput.value)}</strong> aus <strong>${escapeHTML(stadtInput.value)}</strong>, für dein Beitrittsgesuch.
                        </p>
                        <p class="success-message" style="margin-top: 1rem; font-size: 0.85em; opacity: 0.7;">
                            Eine Bestätigung wurde an <strong>${escapeHTML(emailInput.value)}</strong> verschickt. 
                            Wir melden uns in Kürze über verschlüsselte Kanäle.
                        </p>
                    </div>
                `;
                container.insertAdjacentHTML("beforeend", successContent);
            }, 1500);
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
    let particles = [];
    const particleCount = 65;
    const connectionDistance = 110;
    
    const mouse = {
        x: null,
        y: null,
        radius: 140,
        active: false
    };

    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Mouse listeners bound to window for smoother tracking over overlays
    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Active when inside the canvas bounds
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

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Velocities
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1.5; // size 1.5 to 3.5
            // Dynamic colors from our design system (orange and pink)
            this.color = Math.random() > 0.5 ? '#F79B06' : '#F6BAFF';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on bounds
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Keep strictly in bounds
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width) this.x = canvas.width;
            if (this.y < 0) this.y = 0;
            if (this.y > canvas.height) this.y = canvas.height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            // Draw lines to mouse if close
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = p1.x - mouse.x;
                const dy = p1.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(247, 155, 6, ${1 - (dist / mouse.radius)})`; // Glowing orange
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Draw lines to other particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    // Fade color based on distance
                    const alpha = 1 - (dist / connectionDistance);
                    ctx.strokeStyle = `rgba(246, 186, 255, ${alpha * 0.25})`; // Subtle pink line
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
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
